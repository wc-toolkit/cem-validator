/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "./logger.js";
import {
  Component,
  deepMerge,
} from "@wc-toolkit/cem-utilities";
import * as cem from "custom-elements-manifest";
import type { CemValidatorOptions, RuleFailure, Severity } from "./types.js";
import { getCemPublishedFailure, getComponentDefinitionPathFailure, getComponentModulePathFailure, getComponentTagNameFailure, getComponentTypeDefinitionPathFailure, getDefinitions, getExportsPropertyFailure, getMainPropertyFailure, getMissingExportedTypes, getPackageJson, getPackageTypeFailure, getSchemaVersionFailure, getTypesPropertyFailure, getCustomElementsFailure } from "./utilities.js";

export let failures: RuleFailure[] = [];
let log: Logger;
let userOptions: CemValidatorOptions = {
  packageJsonPath: "./package.json",
  cemFileName: "custom-elements.json",
  rules: {
    packageJson: {
      packageType: "warning",
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

export async function validateCem(cem: unknown, options: CemValidatorOptions = {}) {
  log = new Logger(options.debug);
  if (options.skip) {
    log.yellow("[cem-validator] - Skipped");
    return;
  }

  userOptions = deepMerge(userOptions, options);
  const packageJson = getPackageJson(userOptions.packageJsonPath!);

  log.log("[cem-validator] - Validating Custom Elements Manifest...");
  await testRules(packageJson, cem);
  reportResults();
  log.green("[cem-validator] - Custom Elements Manifest validation complete.");
}

async function testRules(packageJson: unknown, cem: unknown) {
  testPackageJson(packageJson);
  await testManifest(cem as cem.Package);
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

    log.red(errorMessage, true);

    if (!userOptions.logErrors && errors.length) {
      throw new Error(`Custom Elements Manifest validation failed due to errors (${errors.length}).`);
    }
  }
}

export function testPackageJson(packageJson: any) {
  const rules = userOptions.rules!.packageJson!;
  if (!packageJson) {
    addFailure(
      "packageJson",
      "error",
      "The package.json file is missing or invalid.",
    );
    return;
  }
  testPackageType(packageJson.type, rules.packageType!);
  if (!packageJson.exports && !packageJson.browser) {
    testMainProperty(packageJson.main, rules.main!);
    testTypesProperty(packageJson.types, rules.types!);
  } else {
    testExportsProperty(packageJson.exports, rules.exports!);
  }
  testCustomElementsProperty(
    packageJson.customElements,
    rules.customElementsProperty!,
  );
  testCemPublished(
    packageJson.files,
    packageJson.customElements,
    userOptions.cemFileName!,
    userOptions.rules!.packageJson!.publishedCem!,
  );
}

export async function testManifest(manifest: cem.Package) {
  await testSchemaVersion(
    manifest.schemaVersion,
    userOptions.rules!.manifest!.schemaVersion!,
  );
  testComponents(manifest);
}

export function testComponents(manifest: cem.Package) {
  const rules = userOptions.rules!.manifest!;
  const definitions = getDefinitions(manifest);

  manifest.modules.forEach((module) => {
    const exportNames = module.exports?.map((x) => x.declaration?.name) || [];
    module.declarations
      ?.filter((dec) => (dec as cem.CustomElement).customElement)
      .forEach((component) => {
        if( userOptions.exclude?.includes(component.name)) {
          log.log(`[cem-validator] - Skipping validation for excluded component: ${component.name}`);
          return;
        }
        
        testComponentTagName(
          component.name,
          (component as cem.CustomElement).tagName || "",
          rules.tagName!,
        );
        testComponentModulePath(component.name, module.path, rules.modulePath!);
        testComponentDefinitionPath(
          component.name,
          definitions.get((component as cem.CustomElement).tagName || "") || "",
          rules.definitionPath!,
        );
        testComponentTypeDefinitionPath(
          component.name,
          (module as any)["typeDefinitionPath"],
          rules.typeDefinitionPath!,
        );
        testComponentExportTypes(
          component as unknown as Component,
          exportNames,
          rules.exportTypes!,
        );
      });
  });
}

export function testPackageType(moduleType: string, severity: Severity) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "packageJson.moduleType",
    severity,
    () => getPackageTypeFailure(moduleType),
  );
}

export function testMainProperty(main: string, severity: Severity) {
  if (severity === "off") {
    return;
  }
  checkFailure("packageJson.main", severity, () => getMainPropertyFailure(main));
}

export function testTypesProperty(types: string, severity: Severity) {
  if (severity === "off") {
    return;
  }
  checkFailure("packageJson.types", severity, () =>getTypesPropertyFailure(types));
}

export function testExportsProperty(exports: string, severity: Severity) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "packageJson.exports",
    severity,
    () => getExportsPropertyFailure(exports),
  );
}

export function testCustomElementsProperty(
  customElements: string,
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "packageJson.customElements",
    severity,
    () => getCustomElementsFailure(customElements),
  );
}

export function testCemPublished(
  files: string[],
  customElements: string = "",
  cemFileName: string,
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  if (!files?.length) {
    return;
  }
  checkFailure(
    "packageJson.publishedCem",
    severity,
    () => getCemPublishedFailure(files, customElements, cemFileName),
  );
}

export async function testSchemaVersion(
  schemaVersion: string,
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "manifest.schemaVersion",
    severity,
    () => getSchemaVersionFailure(schemaVersion),
  );
}

export function testComponentModulePath(
  componentName: string,
  modulePath: string,
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "manifest.modulePath",
    severity,
    () => getComponentModulePathFailure(componentName, modulePath),
  );
}

export function testComponentDefinitionPath(
  componentName: string,
  definitionPath: string,
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "manifest.definitionPath",
    severity,
    () => getComponentDefinitionPathFailure(componentName, definitionPath),
  );
}

export function testComponentTypeDefinitionPath(
  componentName: string,
  definitionPath: string,
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "manifest.modulePath",
    severity,
    () => getComponentTypeDefinitionPathFailure(componentName, definitionPath),
  );
}

export function testComponentExportTypes(
  component: Component,
  exports: string[],
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  const missingTypes = getMissingExportedTypes(component, exports);
  missingTypes.forEach((type) => {
    addFailure(
      "manifest.exportTypes",
      severity,
      `${component.name} is missing exported type "${type}".`,
    );
  });
}

export function testComponentTagName(
  componentName: string,
  tagName: string,
  severity: Severity,
) {
  if (severity === "off") {
    return;
  }
  checkFailure(
    "manifest.tagName",
    severity,
    () => getComponentTagNameFailure(componentName, tagName),
  );
}


function addFailure(rule: string, severity: Severity, message: string) {
  failures.push({
    rule,
    severity,
    message,
  });
}

function checkFailure(
  rule: string,
  severity: Severity,
  getMessage: () => string | null,
) {
  if (severity === "off") {
    return;
  }
  const message = getMessage();
  if (!message) {
    return;
  }
  addFailure(rule, severity, message);
}
