import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import net from 'node:net';
import { homedir, release, totalmem } from 'node:os';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const COMFYUI_TAG = 'v0.45.0';
const COMFYUI_COMMIT = '989d93d0d968e704c589ce0146bb18c77f6b50cc';
const COMFY_CLI = 'comfy-cli==1.25.0';
const COMFY_MCP = 'comfy-mcp==0.10.0';
const MCP_SDK = 'mcp==2.3.0';
const CHECKPOINT = 'v1-5-pruned-emaonly-fp16.safetensors';
const CHECKPOINT_URL = 'https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/9cfd069101959ca3828bf9c04a4419870832b74f/' + CHECKPOINT;
const CHECKPOINT_SIZE = 2_132_696_762;
const CHECKPOINT_SHA256 = 'e9476a13728cd75d8279f6ec8bad753a66a1957ca375a1464dc63b37db6e3916';
const GIB = 1024 ** 3;
const RUNTIME_VERSION = 1;
const STARTUP_MS = 120_000;
const GENERATION_MS = 15 * 60_000;
const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');

const DIMENSIONS = {
  '1:1': [512, 512],
  '4:3': [576, 432],
  '3:4': [432, 576],
  '16:9': [640, 360],
  '9:16': [360, 640],
};

// The pinned CLI has no config-directory override. Scope the CLI's config
// and workspace defaults without changing the host user's home directory.
const CLI_ISOLATION = `import os
from comfy_cli import constants
for system in constants.DEFAULT_CONFIG:
    constants.DEFAULT_CONFIG[system] = os.environ["FPS_COMFY_CLI_CONFIG"]
    constants.DEFAULT_COMFY_WORKSPACE[system] = os.environ["COMFY_PROJECT"]
`;

const SUBMIT_WORKFLOW = `import json, os, sys
from pathlib import Path
import anyio
from comfy_cli.cql.default_workflow import build_default_workflow
from mcp import ClientSession, StdioServerParameters, stdio_client

request = json.load(sys.stdin)

async def run():
    server = StdioServerParameters(
        command=sys.executable,
        args=["-c", "from comfy_mcp.server import main; main()"],
        env=dict(os.environ),
    )
    async with stdio_client(server) as streams:
        async with ClientSession(*streams, read_timeout_seconds=90) as client:
            await client.initialize()
            if request is None:
                tools = await client.list_tools()
                if not any(tool.name == "run_workflow" for tool in tools.tools):
                    raise RuntimeError("Comfy MCP does not expose run_workflow")
                print(json.dumps({"ready": True}))
                return

            workflow_path = Path(request["path"])
            graph = build_default_workflow(
                prompt=request["prompt"],
                overrides=[f'{key}={value}' for key, value in request["overrides"].items()],
            )
            workflow_path.write_text(json.dumps(graph), encoding="utf-8")
            reply = await client.call_tool("run_workflow", {
                "workflow_path": str(workflow_path), "wait": False, "confirm_spend": False,
            })
            print(reply.model_dump_json(by_alias=True))

anyio.run(run)
`;

function unsupportedReason() {
  const apple = process.platform === 'darwin' && process.arch === 'arm64' &&
    Number(release().split('.')[0]) >= 23;
  const windows = process.platform === 'win32' && process.arch === 'x64';
  const linux = process.platform === 'linux' && process.arch === 'x64';
  if (!apple && !windows && !linux) {
    return 'Local image setup supports Apple Silicon with macOS 14 or later, Windows x64, and Linux x64 with glibc 2.28 or later.';
  }
  if (linux) {
    const glibc = process.report?.getReport()?.header?.glibcVersionRuntime;
    const [major, minor] = (glibc || '0.0').split('.').map(Number);
    if (major < 2 || (major === 2 && minor < 28)) return 'Local image setup on Linux requires glibc 2.28 or later.';
  }
  if (totalmem() < 7.5 * GIB) return 'Local image generation requires at least 8 GB of system memory.';
  return '';
}

function processEnvironment(extra = {}) {
  const env = {};
  const allowed = /^(SYSTEMROOT|WINDIR|SYSTEMDRIVE|COMSPEC|PATHEXT|TMPDIR|TMP|TEMP|LANG|LC_ALL|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY|SSL_CERT_FILE|SSL_CERT_DIR|REQUESTS_CA_BUNDLE)$/i;
  for (const [key, value] of Object.entries(process.env)) {
    if (allowed.test(key) && value != null) env[key] = value;
  }
  const inheritedPath = Object.entries(process.env).find(([key]) => key.toUpperCase() === 'PATH')?.[1];
  const additional = process.platform === 'win32' ? [] : [path.join(homedir(), '.local', 'bin'), '/usr/local/bin', '/usr/bin', '/bin'];
  if (process.platform === 'darwin') additional.unshift('/opt/homebrew/bin');
  env.PATH = [inheritedPath, ...additional].filter(Boolean).join(path.delimiter);
  env.NO_PROXY = [env.NO_PROXY || env.no_proxy, '127.0.0.1', 'localhost'].filter(Boolean).join(',');
  delete env.no_proxy;
  return {
    ...env,
    PIP_CONFIG_FILE: process.platform === 'win32' ? 'nul' : '/dev/null',
    PIP_NO_INPUT: '1',
    PYTHONNOUSERSITE: '1',
    PYTHONUTF8: '1',
    GIT_TERMINAL_PROMPT: '0',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: process.platform === 'win32' ? 'NUL' : '/dev/null',
    DO_NOT_TRACK: '1',
    COMFY_NO_TELEMETRY: '1',
    ...extra,
  };
}

function startProcess(file, args, { cwd, env, input } = {}) {
  const child = spawn(file, args, {
    cwd, env, detached: process.platform !== 'win32', windowsHide: true,
    stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
  });
  let output = '';
  let diagnostics = '';
  let failure;
  child.stdout.setEncoding('utf8').on('data', (data) => { output = (output + data).slice(-32_768); });
  child.stderr.setEncoding('utf8').on('data', (data) => { diagnostics = (diagnostics + data).slice(-8_192); });
  if (child.stdin) {
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  }
  const result = new Promise((resolve) => {
    child.once('error', (error) => { failure = error; });
    child.once('close', (code, signal) => resolve({ code, signal, failure, output, diagnostics }));
  });
  async function stop() {
    if (child.pid && child.exitCode == null && child.signalCode == null) {
      if (process.platform === 'win32') {
        const killer = spawn('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], {
          windowsHide: true, stdio: 'ignore',
        });
        killer.once('error', () => child.kill());
        killer.once('exit', (code) => { if (code) child.kill(); });
      } else {
        try { process.kill(-child.pid, 'SIGKILL'); } catch {}
      }
    }
    await result;
  }
  return {
    result, stop,
    alive: () => child.pid && child.exitCode == null && child.signalCode == null && !failure,
  };
}

function cleanMessage(value) {
  return String(value ?? '')
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/https?:\/\/\S+/g, '[URL]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(-400);
}

async function runCommand(file, args, { signal, input, cwd, env } = {}) {
  signal?.throwIfAborted();
  const process = startProcess(file, args, { input, cwd, env });
  const stop = () => { void process.stop(); };
  signal?.addEventListener('abort', stop, { once: true });
  if (signal?.aborted) stop();
  try {
    const result = await process.result;
    signal?.throwIfAborted();
    if (result.failure) throw result.failure;
    if (result.code !== 0) {
      throw new Error(cleanMessage(result.diagnostics || result.output) || `Process exited with ${result.code ?? result.signal}.`);
    }
    return result.output.trim();
  } finally {
    signal?.removeEventListener('abort', stop);
  }
}

async function findPython(options) {
  const windows = process.platform === 'win32';
  const versions = ['3.12', '3.13', '3.11'];
  const candidates = windows
    ? [...versions.map((version) => ['py.exe', ['-' + version]]), ['python.exe', []]]
    : [...versions.map((version) => ['python' + version, []]), ['python3', []]];
  const probe = 'import ensurepip, json, platform, sys, venv; print(json.dumps([sys.executable, *sys.version_info[:2], platform.machine().lower()]))';
  for (const [command, args] of candidates) {
    try {
      const output = await runCommand(command, [...args, '-I', '-c', probe], {
        ...options, signal: AbortSignal.any([options.signal, AbortSignal.timeout(6_000)]),
      });
      const [exe, major, minor, arch] = JSON.parse(output);
      const supportedArchitecture = process.arch === 'arm64' ? ['arm64', 'aarch64'] : ['x86_64', 'amd64'];
      if (major === 3 && [11, 12, 13].includes(minor) && supportedArchitecture.includes(arch) && path.isAbsolute(exe)) {
        return exe;
      }
    } catch {
      options.signal.throwIfAborted();
    }
  }
  throw new Error('Install native Python 3.11, 3.12 or 3.13 with venv and pip, then retry setup.');
}

async function pytorchIndex(options) {
  if (process.platform === 'darwin') return [];
  try {
    const output = await runCommand('nvidia-smi', ['--query-gpu=driver_version,compute_cap', '--format=csv,noheader'], {
      ...options, signal: AbortSignal.any([options.signal, AbortSignal.timeout(8_000)]),
    });
    const minimumDriver = process.platform === 'win32' ? 571 : 570;
    if (output.split(/\r?\n/).some((row) => {
      const [driver, capability] = row.split(',').map((part) => parseFloat(part.trim()));
      return driver >= minimumDriver && capability >= 7.5;
    })) return ['--index-url', 'https://download.pytorch.org/whl/cu128'];
  } catch {
    options.signal.throwIfAborted();
  }
  return ['--index-url', 'https://download.pytorch.org/whl/cpu'];
}

async function checkpointMatches(file, signal) {
  const stat = await fs.lstat(file).catch(() => null);
  if (!stat?.isFile() || stat.size !== CHECKPOINT_SIZE) return false;
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file, { signal })) hash.update(chunk);
  return hash.digest('hex') === CHECKPOINT_SHA256;
}

async function installCheckpoint(file, signal) {
  if (await checkpointMatches(file, signal)) return;
  await fs.mkdir(path.dirname(file), { recursive: true });
  const partial = file + '.download';
  await fs.rm(partial, { force: true });
  try {
    const response = await fetch(CHECKPOINT_URL, { signal });
    if (!response.ok || !response.body) throw new Error(`Model download returned HTTP ${response.status}.`);
    const hash = createHash('sha256');
    let size = 0;
    const verify = new Transform({
      transform(chunk, _encoding, next) {
        size += chunk.length;
        if (size > CHECKPOINT_SIZE) return next(new Error('Model download exceeded the expected size.'));
        hash.update(chunk);
        next(null, chunk);
      },
    });
    await pipeline(Readable.fromWeb(response.body), verify, createWriteStream(partial, { flags: 'wx', mode: 0o600 }), { signal });
    if (size !== CHECKPOINT_SIZE || hash.digest('hex') !== CHECKPOINT_SHA256) {
      throw new Error('The downloaded model failed its integrity check.');
    }
    signal.throwIfAborted();
    await fs.rm(file, { force: true });
    await fs.rename(partial, file);
  } finally {
    await fs.rm(partial, { force: true });
  }
}

async function availablePort() {
  const server = net.createServer();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function localJson(base, endpoint, signal) {
  const response = await fetch(base + endpoint, {
    redirect: 'error', signal: AbortSignal.any([signal, AbortSignal.timeout(4_000)]),
  });
  if (!response.ok) throw new Error(`ComfyUI returned HTTP ${response.status}.`);
  return response.json();
}

async function waitForComfy(server, address, signal) {
  const until = Date.now() + STARTUP_MS;
  while (Date.now() < until) {
    signal.throwIfAborted();
    if (!server.alive()) {
      const result = await server.result;
      throw new Error(cleanMessage(result.diagnostics || result.failure?.message) || 'ComfyUI stopped while starting.');
    }
    try {
      const data = await localJson(address, '/system_stats', signal);
      if (data?.system?.comfyui_version === COMFYUI_TAG.slice(1) && server.alive()) return;
    } catch {}
    await delay(600, undefined, { signal });
  }
  throw new Error('ComfyUI did not start in time.');
}

function parseMcpSubmission(output) {
  const result = JSON.parse(output.split(/\r?\n/).at(-1));
  const rawText = result.content?.find((item) => item.type === 'text')?.text;
  if (result.isError) throw new Error(cleanMessage(rawText) || 'Comfy MCP rejected the workflow.');
  const payload = result.structuredContent ?? JSON.parse(rawText || '{}');
  const promptId = payload.prompt_id ?? payload.result?.prompt_id;
  if (typeof promptId !== 'string' || !/^[a-f\d-]{36}$/i.test(promptId)) {
    throw new Error('Comfy MCP did not return a job ID.');
  }
  return promptId;
}

async function waitForPng(server, address, promptId, outputDirectory, signal) {
  while (server.alive()) {
    signal.throwIfAborted();
    const history = await localJson(address, '/history/' + promptId, signal).catch((error) => {
      signal.throwIfAborted();
      if (error.name !== 'TimeoutError' && !(error instanceof TypeError)) throw error;
      return {};
    });
    const job = history[promptId];
    if (!job) {
      await delay(1_000, undefined, { signal });
      continue;
    }
    const problem = job.status?.messages?.find(([kind]) => kind === 'execution_error')?.[1];
    if (!job.status?.completed || problem) {
      throw new Error(cleanMessage(problem?.exception_message) || 'ComfyUI could not complete the image.');
    }
    const output = Object.values(job.outputs || {}).flatMap((entry) => entry.images || [])
      .find((entry) => entry.type === 'output' && !entry.subfolder && /^[\w.-]+\.png$/i.test(entry.filename));
    if (!output) throw new Error('ComfyUI returned no PNG image.');
    const file = path.join(outputDirectory, output.filename);
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.size > 20 * 1024 * 1024) throw new Error('The generated image is invalid or too large.');
    const bytes = await fs.readFile(file, { signal });
    if (!bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) throw new Error('ComfyUI returned an invalid PNG.');
    return { bytes, extension: 'png', mediaType: 'image/png' };
  }
  const result = await server.result;
  throw new Error(cleanMessage(result.diagnostics || result.failure?.message) || 'ComfyUI stopped before completing the image.');
}

export function createComfyImageRuntime({ directory }) {
  if (!path.isAbsolute(directory)) throw new TypeError('ComfyUI requires an absolute runtime directory.');
  const workspace = path.join(directory, 'ComfyUI');
  const venv = path.join(directory, 'python');
  const bin = path.join(venv, process.platform === 'win32' ? 'Scripts' : 'bin');
  const python = path.join(bin, process.platform === 'win32' ? 'python.exe' : 'python');
  const comfy = path.join(bin, process.platform === 'win32' ? 'comfy.exe' : 'comfy');
  const isolation = path.join(directory, 'isolation');
  const shim = path.join(isolation, 'sitecustomize.py');
  const config = path.join(directory, 'comfy-cli');
  const cache = path.join(directory, 'cache');
  const marker = path.join(directory, 'ready.json');
  const checkpoint = path.join(workspace, 'models', 'checkpoints', CHECKPOINT);
  const main = path.join(workspace, 'main.py');
  const unsupported = unsupportedReason();
  const lifecycle = new AbortController();
  let transient;
  let installation;
  let installControl;
  let generating = false;

  function runtimeEnv(address) {
    return processEnvironment({
      PYTHONPATH: isolation,
      FPS_COMFY_CLI_CONFIG: config,
      COMFY_PROJECT: workspace,
      COMFY_BIN: comfy,
      COMFY_LOCAL_URL: address,
      COMFY_CACHE_DIR: cache,
      XDG_CACHE_HOME: cache,
      HF_HOME: cache,
      HF_HUB_OFFLINE: '1',
      PYTORCH_ENABLE_MPS_FALLBACK: '1',
    });
  }

  async function ready() {
    const installed = await fs.readFile(marker, 'utf8').then(JSON.parse).catch(() => null);
    if (installed?.version !== RUNTIME_VERSION || !['cpu', 'mps', 'cuda'].includes(installed.device)) return null;
    const expected = await fs.lstat(checkpoint).catch(() => null);
    if (!expected?.isFile() || expected.size !== CHECKPOINT_SIZE) return null;
    const found = await Promise.all([main, python, comfy, shim].map((file) => fs.access(file).then(() => true, () => false)));
    return found.every(Boolean) ? installed : null;
  }

  async function status() {
    if (unsupported) return { state: 'unsupported', detail: unsupported };
    if (transient) return { ...transient };
    const installed = await ready();
    return installed ? { state: 'ready', device: installed.device } : { state: 'missing' };
  }

  async function withComfy(device, signal, operation) {
    const job = await fs.mkdtemp(path.join(directory, 'job-'));
    let server;
    try {
      signal.throwIfAborted();
      const port = await availablePort();
      const address = `http://127.0.0.1:${port}`;
      const output = path.join(job, 'output');
      const input = path.join(job, 'input');
      const temp = path.join(job, 'temp');
      const user = path.join(job, 'user');
      await Promise.all([output, input, temp, user].map((dir) => fs.mkdir(dir, { mode: 0o700 })));
      const env = runtimeEnv(address);
      const args = [main, '--listen', '127.0.0.1', '--port', String(port), '--offline',
        '--disable-all-custom-nodes', '--disable-metadata', '--output-directory', output,
        '--temp-directory', temp, '--input-directory', input, '--user-directory', user];
      if (device === 'cpu') args.push('--cpu');
      signal.throwIfAborted();
      server = startProcess(python, args, { cwd: workspace, env });
      await waitForComfy(server, address, signal);
      return await operation({ server, address, env, job, output });
    } finally {
      await server?.stop();
      await fs.rm(job, { recursive: true, force: true }).catch(() => {});
    }
  }

  async function setUp(signal) {
    let scratch;
    const stage = (value) => { transient = { state: 'installing', stage: value }; };
    try {
      if (await ready()) { transient = undefined; return; }
      await fs.mkdir(directory, { recursive: true, mode: 0o700 });
      const space = await fs.statfs(directory).catch(() => null);
      if (space && space.bavail * space.bsize < 16 * GIB) {
        throw new Error('Local setup requires 16 GiB of free disk space.');
      }
      scratch = await fs.mkdtemp(path.join(directory, 'setup-'));
      const options = { signal, env: processEnvironment({ TMPDIR: scratch, TMP: scratch, TEMP: scratch }) };
      const base = await findPython(options);
      try {
        await runCommand('git', ['--version'], { ...options, signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]) });
      } catch {
        signal.throwIfAborted();
        throw new Error('Install Git and make it available on PATH, then retry setup.');
      }
      const index = await pytorchIndex(options);

      stage('environment');
      await runCommand(base, ['-I', '-m', 'venv', venv], options);

      stage('comfyui');
      const revision = await runCommand('git', ['-C', workspace, 'rev-parse', 'HEAD'], options).catch(() => '');
      signal.throwIfAborted();
      if (revision !== COMFYUI_COMMIT) {
        await fs.rm(workspace, { recursive: true, force: true });
        await runCommand('git', ['clone', '--depth', '1', '--single-branch', '--branch', COMFYUI_TAG,
          'https://github.com/Comfy-Org/ComfyUI.git', workspace], options);
        const checkedOut = await runCommand('git', ['-C', workspace, 'rev-parse', 'HEAD'], options);
        if (checkedOut !== COMFYUI_COMMIT) throw new Error('The official ComfyUI version did not match the pinned revision.');
      }

      stage('dependencies');
      const pip = ['-I', '-m', 'pip', 'install', '--disable-pip-version-check', '--no-cache-dir', '--only-binary=:all:'];
      const torchPackages = ['torch==2.11.0', 'torchvision==0.26.0'];
      await runCommand(python, [...pip, ...index, ...torchPackages], options);
      await runCommand(python, [...pip, '--index-url', 'https://pypi.org/simple',
        '-r', path.join(workspace, 'requirements.txt'), ...torchPackages, COMFY_CLI, COMFY_MCP, MCP_SDK], options);
      const device = await runCommand(python, ['-I', '-c', 'import torch; print("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")'], options);

      stage('verifying');
      await Promise.all([config, isolation, cache].map((dir) => fs.mkdir(dir, { recursive: true, mode: 0o700 })));
      await fs.writeFile(shim, CLI_ISOLATION, { mode: 0o600 });
      await withComfy(device, signal, ({ env }) =>
        runCommand(python, ['-c', SUBMIT_WORKFLOW], { signal, cwd: workspace, env, input: 'null' }));

      stage('model');
      await installCheckpoint(checkpoint, signal);

      const partial = marker + '.' + randomBytes(8).toString('hex');
      try {
        await fs.writeFile(partial, JSON.stringify({ version: RUNTIME_VERSION, device }), { mode: 0o600, signal });
        signal.throwIfAborted();
        await fs.rename(partial, marker);
      } finally {
        await fs.rm(partial, { force: true }).catch(() => {});
      }
      transient = undefined;
    } catch (error) {
      if (signal.aborted && signal.reason?.name !== 'TimeoutError') {
        transient = undefined;
        return;
      }
      transient = {
        state: 'error', stage: transient?.stage,
        detail: signal.aborted ? 'ComfyUI setup timed out. Retry the download and setup.' : cleanMessage(error?.message),
      };
      throw new Error(transient.detail);
    } finally {
      if (scratch) await fs.rm(scratch, { recursive: true, force: true }).catch(() => {});
    }
  }

  function install() {
    if (unsupported) return Promise.reject(new Error(unsupported));
    if (lifecycle.signal.aborted) return Promise.reject(lifecycle.signal.reason);
    if (installation) return installation;
    if (generating) return Promise.reject(new Error('ComfyUI is currently generating an image.'));
    installControl = new AbortController();
    const signal = AbortSignal.any([lifecycle.signal, installControl.signal, AbortSignal.timeout(90 * 60_000)]);
    transient = { state: 'installing', stage: 'checking' };
    installation = setUp(signal).finally(() => {
      installation = undefined;
      installControl = undefined;
    });
    return installation;
  }

  async function cancelInstall() {
    installControl?.abort();
    await installation?.catch(() => {});
    return status();
  }

  async function generate({ prompt, aspectRatio = '1:1', signal }) {
    if (unsupported) throw new Error(unsupported);
    if (installation) throw new Error('Wait until ComfyUI setup is complete.');
    if (generating) throw new Error('ComfyUI is already generating an image.');
    if (!Object.hasOwn(DIMENSIONS, aspectRatio)) throw new Error('This aspect ratio is unsupported by the local image workflow.');
    const [width, height] = DIMENSIONS[aspectRatio];
    const runSignal = AbortSignal.any([lifecycle.signal, AbortSignal.timeout(GENERATION_MS), ...(signal ? [signal] : [])]);
    generating = true;
    try {
      const installed = await ready();
      if (!installed) throw new Error('Complete ComfyUI setup in image generation settings.');
      return await withComfy(installed.device, runSignal, async ({ server, address, env, job, output }) => {
        const input = JSON.stringify({
          path: path.join(job, 'workflow.json'), prompt,
          overrides: { checkpoint: CHECKPOINT, width, height, seed: randomBytes(4).readUInt32BE() },
        });
        const reply = await runCommand(python, ['-c', SUBMIT_WORKFLOW], {
          cwd: workspace, env, input, signal: runSignal,
        });
        return waitForPng(server, address, parseMcpSubmission(reply), output, runSignal);
      });
    } finally {
      generating = false;
    }
  }

  function dispose() {
    lifecycle.abort();
  }

  return { status, install, cancelInstall, generate, dispose };
}
