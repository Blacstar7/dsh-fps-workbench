import { createHash } from 'node:crypto'

const Z_IMAGE_ORIGIN = 'https://tongyi-mai-z-image-turbo.hf.space'
const POLLINATIONS_ORIGIN = 'https://gen.pollinations.ai'
const COGVIEW_MEDIA_HOSTS = new Set(['aigc-files.bigmodel.cn', 'cdn.bigmodel.cn'])
const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const MAX_METADATA_BYTES = 2 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 120_000

// The Space returns its bundled 1024px moderation placeholder as a successful image.
const Z_IMAGE_PLACEHOLDER_HASHES = new Set([
  '56a3fc374cd6d07e1f037977393ba946ae6cfcd364d963523f05b40d0b635c62',
  'df8495fbcb33b83c9f8c2476791d97b6d4a235c56e1106be0181342b50218033',
])

export const POLLINATIONS_MODELS = Object.freeze([
  'community/scriptsnsenses-sys/sdxl-lightning-free',
  'community/scriptsnsenses-sys/flux-2-dev-free',
])

const IMAGE_SIZES = Object.freeze({
  '1:1': '1024x1024',
  '9:7': '1152x896',
  '7:9': '896x1152',
  '4:3': '1152x864',
  '3:4': '864x1152',
  '3:2': '1248x832',
  '2:3': '832x1248',
  '16:9': '1280x720',
  '9:16': '720x1280',
  '21:9': '1344x576',
  '9:21': '576x1344',
})

class CloudImageError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

async function checkedFetch(url, options, service) {
  const response = await fetch(url, { ...options, redirect: 'error' })
  if (response.ok) return response
  await response.body?.cancel().catch(() => {})
  if (response.status === 401 || response.status === 403) {
    throw new CloudImageError('configuration', `${service} denied access. Check the service and any required API key permissions.`)
  }
  if (response.status === 402 || response.status === 429) {
    throw new CloudImageError('limit', `${service} refused the request due to a balance, quota, or rate limit.`)
  }
  throw new CloudImageError('upstream', `${service} could not complete the request (HTTP ${response.status}).`)
}

async function* responseChunks(response, maxBytes) {
  const length = response.headers.get('content-length')
  if (!response.body) return
  if (length !== null && Number(length) > maxBytes) {
    await response.body.cancel().catch(() => {})
    throw new CloudImageError('upstream', 'The image service response exceeded the size limit.')
  }
  const reader = response.body.getReader()
  let bytes = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) return
      bytes += value.byteLength
      if (bytes > maxBytes) throw new CloudImageError('upstream', 'The image service response exceeded the size limit.')
      yield value
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

async function readBytes(response, limit) {
  const chunks = []
  for await (const chunk of responseChunks(response, limit)) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function readJson(response, limit = MAX_METADATA_BYTES) {
  const bytes = await readBytes(response, limit)
  try {
    return JSON.parse(bytes.toString('utf8'))
  } catch {
    throw new CloudImageError('upstream', 'The image service returned an invalid response.')
  }
}

function imageResult(bytes) {
  if (bytes.length >= 33 && bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a'
      && bytes.toString('ascii', 12, 16) === 'IHDR') {
    return { bytes, extension: 'png' }
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { bytes, extension: 'jpg' }
  }
  if (bytes.length >= 20 && bytes.toString('ascii', 0, 4) === 'RIFF'
      && bytes.toString('ascii', 8, 12) === 'WEBP') {
    return { bytes, extension: 'webp' }
  }
  throw new CloudImageError('upstream', 'The image service returned an unsupported or invalid image.')
}

function configuredKey(apiKey, service) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : ''
  if (!key || /[^\x21-\x7e]/.test(key)) {
    throw new CloudImageError('configuration', `${service} needs a valid API key in the plugin component configuration.`)
  }
  return key
}

function jsonRequest(body, signal, apiKey) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  return { method: 'POST', headers, body: JSON.stringify(body), signal }
}

async function downloadImage(rawUrl, isAllowedUrl, signal, service) {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    throw new CloudImageError('upstream', `${service} did not return an image link.`)
  }
  if (url.protocol !== 'https:' || url.port || url.username || url.password || !isAllowedUrl(url)) {
    throw new CloudImageError('upstream', `${service} returned an image from an unexpected host or path.`)
  }
  const response = await checkedFetch(url, { signal, headers: { Accept: 'image/*' } }, service)
  return imageResult(await readBytes(response, MAX_IMAGE_BYTES))
}

function rpcEvent(event, id) {
  const data = event.split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n')
  if (!data) return undefined
  try {
    const payload = JSON.parse(data)
    return payload?.id === id ? payload : undefined
  } catch {
    return undefined
  }
}

async function readRpc(response, id) {
  if (!response.headers.get('content-type')?.startsWith('text/event-stream')) {
    return readJson(response)
  }
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of responseChunks(response, MAX_METADATA_BYTES)) {
    buffer += decoder.decode(chunk, { stream: true })
    let separator
    while ((separator = /\r?\n\r?\n/.exec(buffer))) {
      const payload = rpcEvent(buffer.slice(0, separator.index), id)
      if (payload) return payload
      buffer = buffer.slice(separator.index + separator[0].length)
    }
  }
  return rpcEvent(buffer + decoder.decode(), id)
}

function zImageError(response) {
  const detail = response?.error?.message ?? response?.result?.content?.find((item) => item.type === 'text')?.text ?? ''
  if (/quota|rate limit|too many requests|queue (?:is )?full/i.test(detail)) {
    return new CloudImageError('limit', 'The Z-Image-Turbo Space reached its shared GPU or queue limit. Try again later.')
  }
  if (/unsafe|moderation|safety checker/i.test(detail)) {
    return new CloudImageError('unsafe', 'The Z-Image-Turbo Space blocked this request under its safety policy.')
  }
  return new CloudImageError('upstream', 'The Z-Image-Turbo Space could not generate the image.')
}

async function zImage({ prompt, aspectRatio, size, signal }) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  }
  const request = (body) => checkedFetch(`${Z_IMAGE_ORIGIN}/gradio_api/mcp/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', ...body }),
    signal,
  }, 'Z-Image-Turbo')

  const initialized = await request({
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'FPS', version: '1' },
    },
  })
  const init = await readRpc(initialized, 1)
  if (!init?.result?.protocolVersion) throw zImageError(init)
  headers['MCP-Protocol-Version'] = init.result.protocolVersion
  const sessionId = initialized.headers.get('mcp-session-id')
  if (sessionId) headers['Mcp-Session-Id'] = sessionId

  const notification = await request({ method: 'notifications/initialized' })
  await notification.body?.cancel().catch(() => {})
  const response = await request({
    id: 2,
    method: 'tools/call',
    params: {
      name: 'Z_Image_Turbo_generate',
      arguments: {
        prompt,
        resolution: `${size} ( ${aspectRatio} )`,
        seed: 0,
        steps: 8,
        shift: 3,
        random_seed: true,
        gallery_images: [],
      },
    },
  })
  const output = await readRpc(response, 2)
  if (!output?.result || output.result.isError) throw zImageError(output)
  // Gradio versions can return the gallery as structured content or a Python-style text representation.
  const serialized = JSON.stringify(output.result)
  const rawUrl = serialized.match(/https:\/\/tongyi-mai-z-image-turbo\.hf\.space\/(?:gradio_api\/)?file=\/tmp\/gradio\/[a-f0-9]+\/[^\s"'\\]+?\.png\b/i)?.[0]
  if (!rawUrl) throw zImageError(output)
  if (rawUrl.endsWith('/nsfw.png')) {
    throw new CloudImageError('unsafe', 'The Z-Image-Turbo Space blocked this request under its safety policy.')
  }
  const image = await downloadImage(rawUrl, (url) => url.origin === Z_IMAGE_ORIGIN, signal, 'Z-Image-Turbo')
  const [width, height] = size.split('x').map(Number)
  if (image.extension !== 'png') {
    throw new CloudImageError('upstream', 'The Z-Image-Turbo Space returned an unexpected image format.')
  }
  const actualWidth = image.bytes.readUInt32BE(16)
  const actualHeight = image.bytes.readUInt32BE(20)
  const hash = createHash('sha256').update(image.bytes).digest('hex')
  if (Z_IMAGE_PLACEHOLDER_HASHES.has(hash) || (actualWidth === 1024 && actualHeight === 1024 && width !== height)) {
    throw new CloudImageError('unsafe', 'The Z-Image-Turbo Space returned its moderation placeholder.')
  }
  if (actualWidth !== width || actualHeight !== height) {
    throw new CloudImageError('upstream', 'The Z-Image-Turbo Space returned an unexpected image size.')
  }
  return image
}

async function cogview({ prompt, size, apiKey, signal }) {
  const service = 'CogView-3-Flash'
  const response = await checkedFetch('https://open.bigmodel.cn/api/paas/v4/images/generations', jsonRequest({
    model: 'cogview-3-flash',
    prompt,
    size,
    quality: 'standard',
  }, signal, configuredKey(apiKey, service)), service)
  const result = await readJson(response)
  return downloadImage(result?.data?.[0]?.url, (url) => COGVIEW_MEDIA_HOSTS.has(url.hostname), signal, service)
}

async function pollinations({ prompt, size, apiKey, model = POLLINATIONS_MODELS[0], signal }) {
  const service = 'Pollinations'
  const key = configuredKey(apiKey, service)
  if (!POLLINATIONS_MODELS.includes(model)) {
    throw new CloudImageError('configuration', 'Choose an approved Pollinations community model in the plugin configuration.')
  }

  const catalog = await checkedFetch(`${POLLINATIONS_ORIGIN}/image/models`, { signal }, service)
  const models = await readJson(catalog)
  const entry = Array.isArray(models) && models.find((item) => item?.name === model)
  // An empty price table with the currency present denotes a zero-priced community model.
  const price = entry?.pricing
  if (entry?.community !== true || entry.paid_only !== false || price?.currency !== 'pollen'
      || Object.entries(price).some(([field, value]) => field !== 'currency' && value !== 0)) {
    throw new CloudImageError('limit', 'The selected Pollinations model is unavailable as a zero-price community model.')
  }

  const response = await checkedFetch(`${POLLINATIONS_ORIGIN}/v1/images/generations`, jsonRequest({
    model,
    prompt,
    size,
    n: 1,
    response_format: 'b64_json',
  }, signal, key), service)
  const result = await readJson(response, Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + MAX_METADATA_BYTES)
  const base64 = result?.data?.[0]?.b64_json
  if (typeof base64 !== 'string' || base64.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) {
    throw new CloudImageError('upstream', 'Pollinations did not return a supported image within the size limit.')
  }
  return imageResult(Buffer.from(base64, 'base64'))
}

const PROVIDERS = new Map([
  ['z-image', zImage],
  ['cogview', cogview],
  ['pollinations', pollinations],
])

export async function generateCloudImage(provider, { prompt, aspectRatio = '1:1', apiKey, model, signal } = {}) {
  const generate = PROVIDERS.get(provider)
  if (!generate) throw new CloudImageError('configuration', 'Unknown image generation provider.')
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) {
    throw new CloudImageError('invalid_request', 'Enter an image prompt of 1–4000 characters.')
  }
  if (!Object.hasOwn(IMAGE_SIZES, aspectRatio)) {
    throw new CloudImageError('invalid_request', 'Choose one of the supported image aspect ratios.')
  }

  const deadline = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const requestSignal = signal ? AbortSignal.any([signal, deadline]) : deadline
  try {
    return await generate({ prompt: prompt.trim(), aspectRatio, size: IMAGE_SIZES[aspectRatio], apiKey, model, signal: requestSignal })
  } catch (error) {
    if (signal?.aborted) throw signal.reason
    if (deadline.aborted) throw new CloudImageError('timeout', 'The image generation request timed out. Try again later.')
    if (error instanceof CloudImageError) throw error
    throw new CloudImageError('upstream', 'The image service could not be reached or returned an invalid response.')
  }
}
