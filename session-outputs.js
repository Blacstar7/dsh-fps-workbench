import { isAbsolute, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE_TOOLS = new Set(['write', 'edit', 'str_replace_editor', 'apply_patch']);
const IMAGE_TOOL = /(?:^(?:fps_)?|__)generate_image$/u;

function isPath(value) {
  return typeof value === 'string' && value.trim() !== '' && !value.includes('\0');
}

function outputPath(cwd, path) {
  if (!isPath(path)) return null;
  if (isAbsolute(path)) return normalize(path);
  return cwd && !path.startsWith('~/') ? resolve(cwd, path) : null;
}

function addOutputs(state, paths, source) {
  const observed = new Set(paths.map((path) => outputPath(state.cwd, path)).filter(Boolean));
  if (!observed.size) return state;
  const files = new Set(state.files);
  const sources = { ...state.sources };
  for (const path of observed) {
    if (source.kind !== 'reference') files.delete(path);
    files.add(path);
    const previous = sources[path];
    if (source.kind === 'write' || !previous || previous.kind === 'reference') sources[path] = source;
  }
  return { ...state, files: [...files], sources, revision: state.revision + 1 };
}

function location(data) {
  return {
    ...(Number.isSafeInteger(data.turn) && data.turn > 0 ? { turn: data.turn } : {}),
    ...(Number.isSafeInteger(data.step) && data.step >= 0 ? { step: data.step } : {}),
  };
}

function recordedRoute(data) {
  const { source } = data.message;
  return source?.kind === 'model' && isPath(source.provider) && isPath(source.model)
    ? { ...location(data), provider: source.provider, model: source.model } : null;
}

function toolSource(state, data, name, callId) {
  const position = location(data);
  const route = state.route && position.turn !== undefined && position.step !== undefined
    && state.route.turn === position.turn && state.route.step === position.step ? state.route : null;
  return {
    kind: 'write', name, ...position,
    ...(isPath(callId) ? { callId } : {}),
    ...(route ? { provider: route.provider, model: route.model } : {}),
  };
}

function localLinkPath(destination) {
  const value = destination.replace(/\\([\\()[\]<>])/gu, '$1');
  if (/^file:\/\//iu.test(value)) {
    try { return fileURLToPath(value); } catch { return null; }
  }
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|[#?])/iu.test(value)) return null;
  try {
    return decodeURIComponent(value.replace(/#L?\d+(?:-L?\d+)?$/iu, ''));
  } catch {
    return null;
  }
}

function messageLinkPaths(content) {
  const paths = [];
  const link = /(?<!\\)\[(?:\\.|[^\]\\\n])+\]\(\s*(?:<([^<>\n]+)>|((?:\\.|[^\s()\\]|\([^()\s]*\))+))(?:[ \t]+(?:"[^"\n]*"|'[^'\n]*'))?\s*\)/gu;
  for (const part of content) {
    if (part.type !== 'text' || typeof part.text !== 'string') continue;
    let fence;
    const prose = part.text.split(/\r?\n/u).map((line) => {
      const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/u.exec(line);
      if (fence) {
        if (marker?.[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
        return '';
      }
      if (marker) fence = marker[1];
      return marker || /^(?: {4}|\t)/u.test(line) ? '' : line;
    }).join('\n').replace(/(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/gu, '');
    for (const [, angle, bare] of prose.matchAll(link)) {
      const path = localLinkPath(angle ?? bare);
      if (path) paths.push(path);
    }
  }
  return paths;
}

function toolArgumentPath(name, raw) {
  if (name !== 'write' && name !== 'edit' && name !== 'str_replace_editor') return null;
  let args = raw;
  if (typeof raw === 'string') {
    try {
      args = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (name === 'write' || name === 'edit') return args?.file_path;
  if (name === 'str_replace_editor' && ['create', 'insert', 'str_replace'].includes(args?.command)) {
    return args.path;
  }
  return null;
}

function resultPaths(name, content, meta, argumentPath) {
  if (IMAGE_TOOL.test(name)) {
    return (content ?? []).flatMap((part) => {
      if (part.type !== 'text' || typeof part.text !== 'string') return [];
      // The media tool reports its saved path before the provider and aspect ratio.
      const match = /^Saved image to: (.+) \(provider=[^\r\n]+\)\r?$/mu.exec(part.text);
      return match ? [match[1]] : [];
    });
  }
  if (name === 'apply_patch') {
    return (content ?? []).flatMap((part) => {
      if (part.type !== 'text' || typeof part.text !== 'string' ||
        !part.text.startsWith('Success. Updated the following files:\n')) return [];
      return [...part.text.matchAll(/^[AM] (.+)$/gmu)].map((match) => match[1]);
    });
  }
  if (name === 'str_replace_editor' && !argumentPath) return [];
  return FILE_TOOLS.has(name) ? [meta?.path ?? argumentPath] : [];
}

const viewSchema = {
  parse(view) {
    if (!Array.isArray(view?.files) || !view.files.every(isPath)
      || !Number.isSafeInteger(view.revision) || view.revision < 0
      || !view.sources || !view.files.every((path) => ['write', 'delivery', 'reference'].includes(view.sources[path]?.kind))) {
      throw new Error('Invalid session outputs');
    }
    return view;
  },
};

export const sessionOutputsProjection = {
  key: 'workbenchOutputs',
  stateVersion: 5,
  stateSchema: {
    parse(state) {
      if (!state || !(state.cwd === null || isPath(state.cwd)) || !Array.isArray(state.calls) ||
        !state.calls.every((call) => typeof call?.id === 'string' && typeof call.name === 'string' &&
          (call.path === null || isPath(call.path)))) {
        throw new Error('Invalid session output state');
      }
      viewSchema.parse(state);
      return state;
    },
  },
  init: (header) => ({ cwd: header.cwd ?? null, files: [], sources: {}, revision: 0, calls: [], route: null }),
  apply(state, { type, data }) {
    switch (type) {
      case 'working-directory/change':
        return state.cwd === data.cwd ? state : { ...state, cwd: data.cwd };
      case 'deliverables/presented':
        return addOutputs(state, (data.files ?? []).map((file) => file.path), { kind: 'delivery', ...location(data) });
      case 'assistant/message': {
        const content = data.message.content;
        if (data.interrupted) return state;
        if (content.some((part) => part.type === 'tool-call')) {
          const route = recordedRoute(data);
          return route || state.route ? { ...state, route } : state;
        }
        return addOutputs(state, messageLinkPaths(content), { kind: 'reference', ...location(data) });
      }
      case 'tool/call': {
        const { callId, name, arguments: args } = data;
        if (!FILE_TOOLS.has(name) && !IMAGE_TOOL.test(name)) return state;
        const path = outputPath(state.cwd, toolArgumentPath(name, args));
        const source = toolSource(state, data, name, callId);
        return { ...state, calls: [...state.calls, { id: callId, name, path, source }] };
      }
      case 'tool/result': {
        const { message, meta } = data;
        const call = state.calls.find(({ id }) => id === message.source.callId);
        if (!call) return state;
        const settled = { ...state, calls: state.calls.filter(({ id }) => id !== call.id) };
        return message.isError ? settled : addOutputs(settled, resultPaths(call.name, message.content, meta, call.path), call.source);
      }
      case 'tool/ptc-dispatch':
        if (data.isError !== false) return state;
        return addOutputs(state, resultPaths(data.name, data.content, data.meta,
          toolArgumentPath(data.name, data.arguments)), toolSource(state, data, data.name, data.subCallId));
      default:
        return state;
    }
  },
  wire: { summary: false, viewSchema, view: ({ files, sources, revision }) => ({ files, sources, revision }) },
};
