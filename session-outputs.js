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

function addOutputs(state, paths) {
  const files = new Set(state.files);
  for (const path of paths) {
    const absolute = outputPath(state.cwd, path);
    if (absolute) files.add(absolute);
  }
  return files.size === state.files.length ? state : { ...state, files: [...files] };
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

const filesSchema = {
  parse(files) {
    if (!Array.isArray(files) || !files.every(isPath)) throw new Error('Invalid session output files');
    return files;
  },
};

export const sessionOutputsProjection = {
  key: 'workbenchOutputs',
  stateVersion: 3,
  stateSchema: {
    parse(state) {
      if (!state || !(state.cwd === null || isPath(state.cwd)) || !Array.isArray(state.calls) ||
        !state.calls.every((call) => typeof call?.id === 'string' && typeof call.name === 'string' &&
          (call.path === null || isPath(call.path)))) {
        throw new Error('Invalid session output state');
      }
      filesSchema.parse(state.files);
      return state;
    },
  },
  init: (header) => ({ cwd: header.cwd ?? null, files: [], calls: [] }),
  apply(state, { type, data }) {
    switch (type) {
      case 'working-directory/change':
        return state.cwd === data.cwd ? state : { ...state, cwd: data.cwd };
      case 'deliverables/presented':
        return addOutputs(state, (data.files ?? []).map((file) => file.path));
      case 'assistant/message': {
        const content = data.message.content;
        if (data.interrupted || content.some((part) => part.type === 'tool-call')) return state;
        return addOutputs(state, messageLinkPaths(content));
      }
      case 'tool/call': {
        const { callId, name, arguments: args } = data;
        if (!FILE_TOOLS.has(name) && !IMAGE_TOOL.test(name)) return state;
        const path = outputPath(state.cwd, toolArgumentPath(name, args));
        return { ...state, calls: [...state.calls, { id: callId, name, path }] };
      }
      case 'tool/result': {
        const { message, meta } = data;
        const call = state.calls.find(({ id }) => id === message.source.callId);
        if (!call) return state;
        const settled = { ...state, calls: state.calls.filter(({ id }) => id !== call.id) };
        return message.isError ? settled : addOutputs(settled, resultPaths(call.name, message.content, meta, call.path));
      }
      case 'tool/ptc-dispatch':
        if (data.isError !== false) return state;
        return addOutputs(state, resultPaths(data.name, data.content, data.meta,
          toolArgumentPath(data.name, data.arguments)));
      default:
        return state;
    }
  },
  wire: { summary: false, viewSchema: filesSchema, view: (state) => state.files },
};
