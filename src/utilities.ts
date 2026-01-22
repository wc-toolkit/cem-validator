/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import * as cem from "custom-elements-manifest";
import {
  Component,
  getComponentPublicMethods,
  getComponentPublicProperties,
} from "@wc-toolkit/cem-utilities";

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
  "CustomStateSet",
  "ElementInternals",
  "EventInit"
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

const NON_EXPORTABLE_TYPE_NAMES = new Set([
  ...NATIVE_JS_TYPES,
  ...NATIVE_EVENT_TYPES,
  "any",
  "unknown",
  "never",
  "void",
  "undefined",
  "null",
  "boolean",
  "number",
  "string",
  "bigint",
  "symbol",
  "object",
  "array",
  "readonly",
  "readonlyarray",
  "promise",
  "record",
  "partial",
  "required",
  "pick",
  "omit",
  "exclude",
  "extract",
  "nonnullable",
  "parameters",
  "returntype",
  "instancetype",
  "thistype",
  "keyof",
  "typeof",
  "in",
  "infer",
  "as",
  "extends",
  "templateresult",
  "function",
  "true",
  "false",
  "this",
  "internals"
].map((type) => type.toLowerCase()));

const NATIVE_GENERIC_PREFIXES = NATIVE_JS_GENERICS.map((type) =>
  type.toLowerCase(),
);

const NON_EXPORTABLE_PREFIXES = ["html", "svg"];

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
    const baseTypeLower = baseType.toLowerCase();
    return (
      NATIVE_GENERIC_PREFIXES.some((generic) =>
        baseTypeLower.startsWith(generic),
      ) ||
      baseType.startsWith("(") || // Function types
      NON_EXPORTABLE_TYPE_NAMES.has(baseTypeLower)
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
  return !isAlphaOrBeta;
}

export function extractCustomEventType(value?: string): string {
  const match = value?.match(/^CustomEvent<(.+)>$/);
  return match ? match[1] : value || "";
}

export function getPackageJson(packageJsonPath: string): any {
  if (!isValidFilePath(packageJsonPath)) {
    throw new Error(`"${packageJsonPath}" is not a valid file path.`);
  }

  return JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
}

export function getDefinitions(manifest: cem.Package): Map<string, string> {
  const definitions = new Map<string, string>();
  manifest.modules.forEach((mod) =>
    mod.exports
      ?.filter((x) => x.kind === "custom-element-definition")
      ?.forEach((x) => definitions.set(x.name, mod.path)),
  );
  return definitions;
}

export function extractNamedTypes(type: string): string[] {
  if (!type) return [];

  const cleaned = type
    .replace(/'[^']*'|"[^"]*"/g, " ")
    .replace(/\{[^}]*\}/g, " ");
  const withoutParamNames = cleaned.replace(
    /\b[A-Za-z_$][A-Za-z0-9_$]*\s*:/g,
    " ",
  );
  return withoutParamNames
    .split(/[^A-Za-z0-9_$]/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function isExportableTypeName(type: string): boolean {
  const typeLower = type.toLowerCase();
  return (
    !NON_EXPORTABLE_PREFIXES.some((prefix) => typeLower.startsWith(prefix)) &&
    !NON_EXPORTABLE_TYPE_NAMES.has(typeLower) &&
    !type.includes('"') &&
    !type.includes("'") &&
    !type.includes("{")
  );
}

export function collectReferencedTypes(component: Component): string[] {
  const eventTypes: string[] = [];
  component.events
    ?.filter(
      (event) =>
        event?.type?.text &&
        !NATIVE_EVENT_TYPES.includes(event.type.text as any),
    )
    ?.forEach((event) => {
      const extractedType = extractCustomEventType(event.type?.text);
      if (extractedType) {
        eventTypes.push(extractedType);
      }
    });

  const props = getComponentPublicProperties(component) || [];
  const propTypes = props.map((prop) => prop.type?.text);

  const methods = getComponentPublicMethods(component) || [];
  const methodTypes = methods
    ?.map((method) => method.parameters?.map((param) => param?.type?.text))
    .flat();

  const allTypes = [...eventTypes, ...propTypes, ...methodTypes].filter(Boolean);
  return Array.from(
    new Set(
      allTypes.flatMap((type) => extractNamedTypes(type!)).filter(isExportableTypeName),
    ),
  );
}

export const CURRENT_CEM_VERSION = "2.1.0";

export function getPackageTypeFailure(moduleType: string): string | null {
  if (moduleType !== "module") {
    return "Package `type` is not 'module'. More information can be found at: https://nodejs.org/api/packages.html#type.";
  }
  return null;
}

export function getMainPropertyFailure(main: string): string | null {
  if (!main) {
    return "Missing `main` property.";
  }
  if (!isValidFilePath(main)) {
    return "Invalid file path is set to `main` property. More information can be found at: https://nodejs.org/api/packages.html#main.";
  }
  return null;
}

export function getTypesPropertyFailure(types: string): string | null {
  if (!types) {
    return "The package.json is missing a `types` property. More information can be found at: https://nodejs.org/api/packages.html#community-conditions-definitions.";
  }
  if (!isValidFilePath(types)) {
    return "Invalid file path is set to `types` property in the package.json. More information can be found at: https://nodejs.org/api/packages.html#community-conditions-definitions";
  }
  return null;
}

export function getExportsPropertyFailure(exportsValue: string): string | null {
  if (!exportsValue) {
    return "The package.json is missing an `exports` property. More information can be found at: https://nodejs.org/api/packages.html#exports.";
  }
  return null;
}

export function getCustomElementsFailure(customElements: string): string | null {
  if (!customElements) {
    return "The package.json is missing the `customElements` property. You can find more information at: https://github.com/webcomponents/custom-elements-manifest?tab=readme-ov-file#referencing-manifests-from-npm-packages";
  }
  if (!isValidFilePath(customElements)) {
    return "Invalid file path is set to `customElements` property.";
  }
  return null;
}

export function getCemPublishedFailure(
  files: string[],
  customElements: string = "",
  cemFileName: string,
): string | null {
  if (!files?.length) {
    return null;
  }

  const hasCem = files.some((file) => file.endsWith(cemFileName));
  if (hasCem || !customElements) {
    return null;
  }

  const cemRawPath = customElements.replace("./", "");
  const isInSubdirectory = cemRawPath.includes("/");

  if (isInSubdirectory) {
    const cemDirectory = cemRawPath.split("/").slice(0, -1).join("/") + "/";
    const isDirectoryIncluded = files.some((file) =>
      cemDirectory.startsWith(file.replace("./", "")),
    );
    if (isDirectoryIncluded) {
      return null;
    }
  }

  return "The package.json is missing the `custom-elements.json` file in the `files` property. More information can be found at: https://docs.npmjs.com/cli/v10/configuring-npm/package-json?v=true#files.";
}

export function getSchemaVersionFailure(
  schemaVersion: string,
  currentVersion: string = CURRENT_CEM_VERSION,
): string | null {
  if (!schemaVersion) {
    return "The manifest is missing the `schemaVersion` property. For more information, check out: https://github.com/webcomponents/custom-elements-manifest?tab=readme-ov-file#schema-versioning";
  }

  if (!isLatestPackageVersion(schemaVersion, currentVersion)) {
    return `The manifest schema version is outdated. The latest version is ${currentVersion}. For more information, check out: https://github.com/webcomponents/custom-elements-manifest?tab=readme-ov-file#schema-versioning`;
  }

  return null;
}

export function getComponentModulePathFailure(
  componentName: string,
  modulePath: string,
): string | null {
  if (!modulePath) {
    return `${componentName} is missing a module path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  if (modulePath.endsWith(".ts") || modulePath.includes("src/")) {
    return `${componentName} module path does not appear to reference the output path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  if (!isValidFilePath(modulePath)) {
    return `${modulePath} module path is invalid. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  return null;
}

export function getComponentDefinitionPathFailure(
  componentName: string,
  definitionPath: string,
): string | null {
  if (!definitionPath) {
    return `${componentName} is missing a definition path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  if (definitionPath.endsWith(".ts") || definitionPath.includes("src/")) {
    return `${componentName} definition path does not appear to reference the output path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  if (!isValidFilePath(definitionPath)) {
    return `${definitionPath} definition path is invalid. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  return null;
}

export function getComponentTypeDefinitionPathFailure(
  componentName: string,
  definitionPath: string,
): string | null {
  if (!definitionPath) {
    return null;
  }
  if (definitionPath.endsWith(".ts") || !definitionPath.includes("src/")) {
    return `${componentName} definition path does not appear to reference the output path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  if (!isValidFilePath(definitionPath)) {
    return `${definitionPath} definition path is invalid. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }
  return null;
}

export function getComponentTagNameFailure(
  componentName: string,
  tagName: string,
): string | null {
  if (!tagName) {
    return `${componentName} is missing a tag name. You can add one by using the \`@tag\` and \`@tagName\` JSDoc tag.`;
  }
  return null;
}

export function getMissingExportedTypes(
  component: Component,
  exports: string[],
): string[] {
  const referencedTypes = collectReferencedTypes(component);
  const exportSet = new Set(exports);
  return referencedTypes.filter((type) => !exportSet.has(type));
}
