/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "./logger.js";
import {
  Component,
  deepMerge,
  getComponentPublicMethods,
  getComponentPublicProperties,
  getCustomEventDetailTypes,
  JS_TYPES,
} from "@wc-toolkit/cem-utilities";
import fs from "fs";
import * as cem from "custom-elements-manifest";
import type { CemValidatorOptions, RuleFailure, Severity } from "./types.js";
import { isLatestPackageVersion, isValidFilePath } from "./utilities.js";

const CURRENT_CEM_VERSION = "2.1.0";
export let failures: RuleFailure[] = [];
let log: Logger;
let userOptions: CemValidatorOptions = {
  packageJsonPath: "./package.json",
  cemFileName: "custom-elements.json",
  rules: {
    packageJson: {
      moduleType: "warning",
      main: "warning",
      module: "warning",
      types: "warning",
      exports: "warning",
      customElementsProperty: "error",
      publishedCem: "error",
    },
    manifest: {
      schemaVersion: "warning",
      modulePath: "warning",
      definitionPath: "warning",
      typeDefinitionPath: "warning",
      exportTypes: "error",
      tagName: "error",
    },
  },
};

export function validateCem(cem: unknown, options: CemValidatorOptions = {}) {
  log = new Logger(options.debug);
  if (options.skip) {
    log.yellow("[cem-validator] - Skipped");
    return;
  }

  userOptions = deepMerge(userOptions, options);
  const packageJson = getPackageJson(userOptions.packageJsonPath!);

  log.log("[cem-validator] - Validating Custom Elements Manifest...");
  testRules(packageJson, cem);
  reportResults();
  log.green("[cem-validator] - Custom Elements Manifest validation complete.");
}

function testRules(packageJson: unknown, cem: unknown) {
  testPackageJson(packageJson);
  testManifest(cem as cem.Package);
}

function reportResults() {
  const localFailures = failures.filter((f) => f.severity !== "off");
  failures = [];
  if (!localFailures.length) {
    log.green("[cem-validator] - All rules passed. No issues found.");
    return;
  }

  const warnings = localFailures.filter((f) => f.severity === "warning");
  if (warnings.length) {
    log.yellow(`[cem-validator] - ${warnings.length} warning(s) found.`);
    warnings.forEach((warning) => {
      log.yellow(`  - ${warning.rule}: ${warning.message}`, true);
    });
  }

  const errors = localFailures.filter((f) => f.severity === "error");
  if (errors.length) {
    let errorMessage = `[cem-validator] - ${errors.length} error(s) found.\n`;
    errors.forEach((error) => {
      errorMessage += `  - ${error.rule}: ${error.message}\n`;
    });

    if (userOptions.logErrors) {
      log.red(errorMessage, true);
    } else {
      throw new Error(errorMessage);
    }
  }
}

export function testPackageJson(packageJson: any) {
  const rules = userOptions.rules!.packageJson!;
  if (!packageJson) {
    addFailure(
      "packageJson",
      "error",
      "The package.json file is missing or invalid."
    );
    return;
  }
  testPackageType(packageJson.type, rules.moduleType!);
  testMainProperty(packageJson.main, rules.main!);
  testModuleProperty(packageJson.module, rules.module!);
  testTypesProperty(packageJson.types, rules.types!);
  testExportsProperty(packageJson.exports, rules.exports!);
  testCustomElementsProperty(
    packageJson.customElements,
    rules.customElementsProperty!
  );
  testCemPublished(
    packageJson.files,
    userOptions.cemFileName!,
    rules.customElementsProperty!
  );
}

export async function testManifest(manifest: cem.Package) {
  await testSchemaVersion(
    manifest.schemaVersion,
    userOptions.rules!.manifest!.schemaVersion!
  );
  testComponents(manifest);
}

function getPackageJson(packageJsonPath: string): any {
  if (!isValidFilePath(packageJsonPath)) {
    throw new Error(`"${packageJsonPath}" is not a valid file path.`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson;
}

function getDefinitions(manifest: cem.Package): Map<string, string> {
  const definitions = new Map<string, string>();
  manifest.modules.forEach((mod) =>
    mod.exports
      ?.filter((x) => x.kind === "custom-element-definition")
      ?.forEach((x) => definitions.set(x.name, mod.path))
  );
  return definitions;
}

export function testComponents(manifest: cem.Package) {
  const rules = userOptions.rules!.manifest!;
  const definitions = getDefinitions(manifest);

  manifest.modules.forEach((module) => {
    module.declarations
      ?.filter((dec) => (dec as cem.CustomElement).customElement)
      .forEach((component) => {
        testComponentTagName(
          component.name,
          (component as cem.CustomElement).tagName || "",
          rules.tagName!
        );
        testComponentModulePath(component.name, module.path, rules.modulePath!);
        testComponentDefinitionPath(
          component.name,
          definitions.get(component.name) || "",
          rules.definitionPath!
        );
        testComponentTypeDefinitionPath(
          component.name,
          (module as any)["typeDefinitionPath"],
          rules.typeDefinitionPath!
        );
        testComponentExportTypes(
          component as unknown as Component,
          module.exports?.map((x) => x.declaration?.name) || [],
          rules.exportTypes!
        );
      });
  });
}

export function testPackageType(moduleType: string, severity: Severity) {
  if (severity === "off") {
    return;
  }

  if (moduleType !== "module") {
    addFailure(
      "packageJson.moduleType",
      severity,
      "Package `type` is not 'module'. More information can be found at: https://nodejs.org/api/packages.html#type."
    );
  }
}

export function testMainProperty(main: string, severity: Severity) {
  if (severity === "off") {
    return;
  }

  if (!main) {
    addFailure("packageJson.main", severity, "Missing `main` property.");
  } else if (!isValidFilePath(main)) {
    addFailure(
      "packageJson.main",
      severity,
      "Invalid file path is set to `main` property. More information can be found at: https://nodejs.org/api/packages.html#main."
    );
  }
}

export function testModuleProperty(module: string, severity: Severity) {
  if (severity === "off") {
    return;
  }

  if (!module) {
    addFailure("packageJson.module", severity, "Missing `module` property.");
  } else if (!isValidFilePath(module)) {
    addFailure(
      "packageJson.module",
      severity,
      "Invalid file path is set to `module` property. More information can be found at: https://nodejs.org/api/packages.html#module."
    );
  }
}

export function testTypesProperty(types: string, severity: Severity) {
  if (severity === "off") {
    return;
  }

  if (!types) {
    addFailure(
      "packageJson.types",
      severity,
      "The package.json is missing a `types` property. More information can be found at: https://nodejs.org/api/packages.html#community-conditions-definitions."
    );
  } else if (!isValidFilePath(types)) {
    addFailure(
      "packageJson.types",
      severity,
      "Invalid file path is set to `types` property in the package.json. More information can be found at: https://nodejs.org/api/packages.html#community-conditions-definitions"
    );
  }
}

export function testExportsProperty(exports: string, severity: Severity) {
  if (severity === "off") {
    return;
  }

  if (!exports) {
    addFailure(
      "packageJson.exports",
      severity,
      "The package.json is missing an `exports` property. More information can be found at: https://nodejs.org/api/packages.html#exports."
    );
  }
}

export function testCustomElementsProperty(
  customElements: string,
  severity: Severity
) {
  if (severity === "off") {
    return;
  }

  if (!customElements) {
    addFailure(
      "packageJson.customElements",
      severity,
      "The package.json is missing the `customElements` property. You can find more information at: https://github.com/webcomponents/custom-elements-manifest?tab=readme-ov-file#referencing-manifests-from-npm-packages"
    );
  } else if (!isValidFilePath(customElements)) {
    addFailure(
      "packageJson.customElements",
      severity,
      "Invalid file path is set to `customElements` property."
    );
  }
}

export function testCemPublished(
  files: string[],
  cemFileName: string,
  severity: Severity
) {
  if (severity === "off" || !files?.length) {
    return;
  }
  const hasCem = files.some((file) => file.endsWith(cemFileName));
  if (!hasCem) {
    addFailure(
      "packageJson.publishedCem",
      severity,
      "The package.json is missing the `custom-elements.json` file in the `files` property. More information can be found at: https://docs.npmjs.com/cli/v10/configuring-npm/package-json?v=true#files."
    );
  }
}

export async function testSchemaVersion(
  schemaVersion: string,
  severity: Severity
) {
  if (severity === "off") {
    return;
  }

  if (!schemaVersion) {
    addFailure(
      "manifest.schemaVersion",
      severity,
      "The manifest is missing the `schemaVersion` property. For more information, check out: https://github.com/webcomponents/custom-elements-manifest?tab=readme-ov-file#schema-versioning"
    );
    return;
  }

  if (!isLatestPackageVersion(schemaVersion, CURRENT_CEM_VERSION)) {
    addFailure(
      "manifest.schemaVersion",
      severity,
      `The manifest schema version is outdated. The latest version is ${CURRENT_CEM_VERSION}. For more information, check out: https://github.com/webcomponents/custom-elements-manifest?tab=readme-ov-file#schema-versioning`
    );
  }
}

export function testComponentModulePath(
  componentName: string,
  modulePath: string,
  severity: Severity
) {
  if (severity === "off") {
    return;
  }

  let failureMessage = "";
  if (!modulePath) {
    failureMessage = `${componentName} is missing a module path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  } else if (modulePath.endsWith(".ts") || modulePath.includes("src/")) {
    failureMessage = `${componentName} module path does not appear to reference the output path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  } else if (!isValidFilePath(modulePath)) {
    failureMessage = `${modulePath} module path is invalid. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }

  if (failureMessage) {
    addFailure("manifest.modulePath", severity, failureMessage);
  }
}

export function testComponentDefinitionPath(
  componentName: string,
  definitionPath: string,
  severity: Severity
) {
  if (severity === "off") {
    return;
  }

  let failureMessage = "";
  if (!definitionPath) {
    failureMessage = `${componentName} is missing a definition path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  } else if (
    definitionPath.endsWith(".ts") ||
    !definitionPath.includes("src/")
  ) {
    failureMessage = `${componentName} definition path does not appear to reference the output path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  } else if (!isValidFilePath(definitionPath)) {
    failureMessage = `${definitionPath} definition path is invalid. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }

  if (failureMessage) {
    addFailure("manifest.definitionPath", severity, failureMessage);
  }
}

export function testComponentTypeDefinitionPath(
  componentName: string,
  definitionPath: string,
  severity: Severity
) {
  if (severity === "off") {
    return;
  }

  let failureMessage = "";
  if (!definitionPath) {
    return;
  } else if (
    definitionPath.endsWith(".ts") ||
    !definitionPath.includes("src/")
  ) {
    failureMessage = `${componentName} definition path does not appear to reference the output path. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  } else if (!isValidFilePath(definitionPath)) {
    failureMessage = `${definitionPath} definition path is invalid. For help updating this, check out: https://wc-toolkit.com/documentation/module-path-resolver/`;
  }

  if (failureMessage) {
    addFailure("manifest.modulePath", severity, failureMessage);
  }
}

export function testComponentExportTypes(
  component: Component,
  exports: string[],
  severity: Severity
) {
  if (severity === "off") {
    return;
  }

  const eventTypes = getCustomEventDetailTypes(component);
  const props = getComponentPublicProperties(component);
  const propTypes = props.map((prop) => prop.type?.text);

  const methods = getComponentPublicMethods(component);
  const methodTypes = methods
    ?.map((method) => method.parameters?.map((param) => param?.type?.text))
    .flat();

  const allTypes = [...eventTypes, ...propTypes, ...methodTypes].filter(
    (type) => type && isNamedType(type)
  );

  allTypes.forEach((type) => {
    if (!exports.includes(type!)) {
      addFailure(
        "manifest.exportTypes",
        severity,
        `${component.name} is missing exported type "${type}".`
      );
    }
  });
}

export function testComponentTagName(
  componentName: string,
  tagName: string,
  severity: Severity
) {
  if (severity === "off") {
    return;
  }

  if (!tagName) {
    addFailure(
      "manifest.tagName",
      severity,
      `${componentName} is missing a tag name. You can add one by using the \`@tag\` and \`@tagName\` JSDoc tag.`
    );
  }
}

function isNamedType(type: string): boolean {
  return (
    !type.startsWith("HTML") &&
    !type.startsWith("SVG") &&
    !JS_TYPES.has(type || "") &&
    !type.includes('"') &&
    !type.includes("'")
  );
}

function addFailure(rule: string, severity: Severity, message: string) {
  failures.push({
    rule,
    severity,
    message,
  });
}
