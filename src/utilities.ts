export const NATIVE_EVENT_TYPES = [
  "MouseEvent",
  "KeyboardEvent",
  "FocusEvent",
  "InputEvent",
  "UIEvent",
  "WheelEvent",
  "DragEvent",
  "ClipboardEvent",
  "TouchEvent",
  "PointerEvent",
  "AnimationEvent",
  "TransitionEvent",
  "ProgressEvent",
  "Event",
  "ErrorEvent",
  "HashChangeEvent",
  "PageTransitionEvent",
  "PopStateEvent",
  "StorageEvent",
  "MessageEvent",
  "BeforeUnloadEvent",
  "CustomEvent",
] as const;

export const NATIVE_JS_TYPES = [
  // Primitives
  "string",
  "number",
  "boolean",
  "bigint",
  "symbol",
  "undefined",
  "null",
  "any",
  "unknown",
  "never",
  "void",
  "array",
  // Built-in Objects
  "Object",
  "Array",
  "Function",
  "Date",
  "RegExp",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Promise",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "AggregateError",
  // Typed Arrays
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  // Other Built-ins
  "Math",
  "JSON",
  "Intl",
  "Reflect",
  "Proxy",
  "Iterator",
  "AsyncIterator",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  "AsyncGenerator",
  "AsyncGeneratorFunction",
  // Web APIs
  "File",
  "Blob",
  "FormData",
  "FileList",
  "FileReader",
  "Headers",
  "Request",
  "Response",
  "URL",
  "URLSearchParams",
  "AbortController",
  "AbortSignal",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
  "WebSocket",
  "Worker",
  "SharedWorker",
  "MessageChannel",
  "MessagePort",
  "Notification",
  "BroadcastChannel",
  "ImageData",
  "ImageBitmap",
  "TextEncoder",
  "TextDecoder",
  "Crypto",
  "SubtleCrypto",
  "Performance",
  "PerformanceEntry",
  "PerformanceObserver",
  "IntersectionObserver",
  "MutationObserver",
  "ResizeObserver",
  "Window",
  "Document",
  "Element",
  "HTMLElement",
  "ShadowRoot",
  "Node",
  "EventTarget",
  "ScrollBehavior",
  "FocusOptions",
  "VirtualElement",
  "Keyframe",
  "KeyframeAnimationOptions",
  "CSSNumberish",
  "HTMLSlotElement",
  "FillMode",
  "PlaybackDirection",
] as const;

export const NATIVE_JS_GENERICS = [
  "Promise",
  "Iterator",
  "AsyncIterator",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  "AsyncGenerator",
  "AsyncGeneratorFunction",
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
] as const;

export type NativeJSType = (typeof NATIVE_JS_TYPES)[number];

export function isNativeJSType(type: string): boolean {
  if (!type) return false;
  
  // Handle union types by splitting on |
  const types = type
    .replaceAll("<", "|")
    .replaceAll(">", "|")
    .split("|")
    .map((t) => t.trim())
    .filter(Boolean);
  
  // Check if all parts of the union are native types
  return types.every((t) => {
    // Remove array brackets [] if present
    let baseType = t.replace(/\[\]/g, "").trim();
    
    // Extract base type from generics (e.g., "Set<string>" -> "Set")
    const genericMatch = baseType.match(/^([^<{(]+)/);
    if (genericMatch) {
      baseType = genericMatch[1].trim();
    }
    
    // Check if it's in the native types list or native event types list
    return (
      NATIVE_JS_GENERICS.some((generic) => baseType.startsWith(generic)) ||
      baseType.startsWith("(") || // Function types
      NATIVE_JS_TYPES.includes(baseType as NativeJSType) ||
      NATIVE_EVENT_TYPES.includes(baseType as typeof NATIVE_EVENT_TYPES[number])
    );
  });
}

export function isValidFilePath(filePath: string): boolean {
  const regex =
    /^(\/|\.\/|\.\.\/|[a-zA-Z]:[\\/]|\.\\|\.\.\\)?([a-zA-Z0-9_\-./\\]+)$/;
  return regex.test(filePath);
}

export function isLatestPackageVersion(
  currentVersion: string,
  latestVersion: string,
): boolean {
  const isAlphaOrBeta = currentVersion.includes("-");
  const parseVersion = (version: string) =>
    version.split(".").map((x) => parseInt(x));

  const [currMajor, currMinor, currPatch] = parseVersion(currentVersion);
  const [latestMajor, latestMinor, latestPatch] = parseVersion(latestVersion);

  if (currMajor !== latestMajor) {
    return currMajor > latestMajor;
  }
  if (currMinor !== latestMinor) {
    return currMinor > latestMinor;
  }
  if (currPatch !== latestPatch) {
    return currPatch > latestPatch;
  }
  if (currPatch !== latestPatch && isAlphaOrBeta) {
    return currPatch > latestPatch;
  }
  return !isAlphaOrBeta;
}

export function extractCustomEventType(value?: string): string {
  const match = value?.match(/^CustomEvent<(.+)>$/);
  return match ? match[1] : value || "";
}
