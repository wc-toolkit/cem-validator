<div align="center">
  
![workbench with tools, html, css, javascript, and download icon](https://raw.githubusercontent.com/wc-toolkit/cem-validator/refs/heads/main/assets/wc-toolkit_cem-validator.png)

</div>

# WC Toolkit - CEM Validator

This tool validates your [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) to ensure your web components are properly documented and configured for optimal compatibility with IDEs, documentation tools, and component catalogs.

## What Does It Validate?

The validator checks two main areas:

1. **Package.json Configuration** - Ensures your package is properly configured with correct entry points, module types, and custom elements manifest references
2. **Custom Elements Manifest** - Validates that your manifest has proper schema versions, module paths, type definitions, and exports for each component

## Installation

To install the package, use the following command:

```bash
npm install -D @wc-toolkit/cem-validator
```

## Usage

This package can be used in two ways:

1. **As a standalone script** - Run validation programmatically in your build process
2. **As a CEM Analyzer plugin** - Automatically validate during manifest generation

### Script Usage

Run the validator as part of your build process or as a standalone validation step:

```ts
// validate-manifest.ts

import { validateCem, type CemValidatorOptions } from "@wc-toolkit/cem-validator";
import manifest from "./custom-elements.json" with { type: 'json' };

const options: CemValidatorOptions = {
  packageJsonPath: "./package.json",
  cemFileName: "custom-elements.json",
  logErrors: false, // Set to true to log errors instead of throwing an exception
  exclude: ["MyInternalComponent"], // Skip validation for specific components
  rules: { // Override default severity levels for validation
    packageJson: {
      packageType: "off",
      customElementsProperty: "error",
    },
    manifest: {
      tagName: "error",
      exportTypes: "warning",
    }
  }
};

try {
  validateCem(manifest, options);
  console.log("✅ Manifest validation passed!");
} catch (error) {
  console.error("❌ Manifest validation failed:", error);
  process.exit(1);
}
```

### CEM Analyzer Plugin

Integrate validation directly into your manifest generation workflow:

```js
// custom-elements-manifest.config.js

import { cemValidatorPlugin } from "@wc-toolkit/cem-validator";

export default {
  plugins: [
    cemValidatorPlugin({
      logErrors: true, // Log errors without stopping the build
      exclude: ["BaseComponent", "InternalMixin"], // Skip base classes
      rules: { // Override default severity levels for validation
        packageJson: {
          exports: "off",
          customElementsProperty: "error",
        },
        manifest: {
          schemaVersion: "error",
          tagName: "error",
          modulePath: "error",
        }
      }
    })
  ],
};
```

Then run the analyzer:

```bash
npx @custom-elements-manifest/analyzer analyze
```

## Configuration

### Options

#### `packageJsonPath`
- **Type:** `string`
- **Default:** `"./package.json"`
- **Description:** Path to your package.json file. Used to validate package configuration.

```ts
{
  packageJsonPath: "./package.json"
}
```

#### `cemFileName`
- **Type:** `string`
- **Default:** `"custom-elements.json"`
- **Description:** Name of your Custom Elements Manifest file. Used to verify the manifest is properly referenced in package.json.

```ts
{
  cemFileName: "custom-elements.json"
}
```

#### `logErrors`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** When `true`, validation errors are logged to the console instead of throwing exceptions. Useful for CI/CD pipelines where you want to see all errors without stopping the process.

```ts
{
  logErrors: true // Logs errors but doesn't throw
}
```

#### `exclude`
- **Type:** `string[]`
- **Default:** `[]`
- **Description:** Array of component class names to exclude from validation. Useful for base classes, mixins, or internal components that don't need full validation.

```ts
{
  exclude: [
    "MyBaseElement",      // Skip base classes
    "InternalMixin",      // Skip mixins
    "DeprecatedComponent" // Skip deprecated components
  ]
}
```

**Example:** If you have a base component that other components extend:

```ts
// my-base.ts
export class MyBaseElement extends HTMLElement {
  // Base functionality
}

// my-button.ts
export class MyButton extends MyBaseElement {
  // This will be validated
}
```

```ts
// Validation config
{
  exclude: ["MyBaseElement"] // Only validate MyButton, skip MyBaseElement
}
```

#### `debug`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enables verbose logging during the validation process. Helpful for troubleshooting validation issues.

```ts
{
  debug: true // Logs detailed validation steps
}
```

#### `skip`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Completely disables the validator. Useful for conditional execution in different environments.

```ts
{
  skip: process.env.NODE_ENV === "development" // Skip validation in dev
}
```

#### `rules`
- **Type:** `Rules`
- **Description:** Configure which validations to run and their severity levels. Each rule can be set to `"off"`, `"warning"`, or `"error"`.

### Rules Configuration

Rules are organized into two categories: `packageJson` and `manifest`.

#### Package.json Rules

These rules validate your package.json configuration:

##### `packageType`
- **Default:** `"error"`
- **Description:** Ensures the `type` field is set to `"module"` for ESM packages.

```ts
{
  rules: {
    packageJson: {
      packageType: "error" // Requires "type": "module" in package.json
    }
  }
}
```

##### `main`
- **Default:** `"error"`
- **Description:** Validates the `main` field points to a valid entry point file.

```ts
{
  rules: {
    packageJson: {
      main: "error" // Requires valid "main": "./dist/index.js"
    }
  }
}
```

##### `module`
- **Default:** `"error"`
- **Description:** Validates the `module` field points to a valid ESM entry point.

```ts
{
  rules: {
    packageJson: {
      module: "error" // Requires valid "module": "./dist/index.js"
    }
  }
}
```

##### `types`
- **Default:** `"error"`
- **Description:** Validates the `types` field points to a valid TypeScript declaration file.

```ts
{
  rules: {
    packageJson: {
      types: "error" // Requires valid "types": "./dist/index.d.ts"
    }
  }
}
```

##### `exports`
- **Default:** `"error"`
- **Description:** Validates the package has an `exports` field properly configured for modern package resolution.

```ts
{
  rules: {
    packageJson: {
      exports: "error" // Requires "exports" field in package.json
    }
  }
}
```

##### `customElementsProperty`
- **Default:** `"error"`
- **Description:** Validates the `customElements` field in package.json points to your manifest file.

```ts
{
  rules: {
    packageJson: {
      customElementsProperty: "error" // Requires "customElements": "./custom-elements.json"
    }
  }
}
```

##### `publishedCem`
- **Default:** `"error"`
- **Description:** Validates that the Custom Elements Manifest is included in the published package (not excluded by `.npmignore` or `files` field).

```ts
{
  rules: {
    packageJson: {
      publishedCem: "error" // Ensures manifest is published with package
    }
  }
}
```

#### Manifest Rules

These rules validate your Custom Elements Manifest:

##### `schemaVersion`
- **Default:** `"error"`
- **Description:** Validates the manifest uses the latest schema version.

```ts
{
  rules: {
    manifest: {
      schemaVersion: "error" // Ensures latest schema version
    }
  }
}
```

##### `modulePath`
- **Default:** `"error"`
- **Description:** Validates each component has a valid module path that exists.

```ts
{
  rules: {
    manifest: {
      modulePath: "error" // Ensures "./src/my-button.ts" exists
    }
  }
}
```

##### `definitionPath`
- **Default:** `"error"`
- **Description:** Validates each component has a valid path to its definition/implementation.

```ts
{
  rules: {
    manifest: {
      definitionPath: "error" // Ensures component definition is valid
    }
  }
}
```

##### `typeDefinitionPath`
- **Default:** `"error"`
- **Description:** Validates each component has a valid TypeScript declaration file path.

```ts
{
  rules: {
    manifest: {
      typeDefinitionPath: "error" // Ensures "./dist/my-button.d.ts" exists
    }
  }
}
```

##### `exportTypes`
- **Default:** `"error"`
- **Description:** Validates that all necessary types are exported from the module.

```ts
{
  rules: {
    manifest: {
      exportTypes: "warning" // Warns if types aren't exported
    }
  }
}
```

##### `tagName`
- **Default:** `"error"`
- **Description:** Validates each custom element has a tag name defined.

```ts
{
  rules: {
    manifest: {
      tagName: "error" // Requires <my-button> tag name
    }
  }
}
```

### Complete Configuration Example

Here's a comprehensive example showing all options:

```ts
import { validateCem, type CemValidatorOptions } from "@wc-toolkit/cem-validator";
import manifest from "./custom-elements.json" with { type: 'json' };

const options: CemValidatorOptions = {
  // File paths
  packageJsonPath: "./package.json",
  cemFileName: "custom-elements.json",
  
  // Behavior
  logErrors: false,
  debug: false,
  skip: false,
  
  // Exclude specific components
  exclude: [
    "BaseElement",
    "InternalMixin"
  ],
  
  // Rule configuration
  rules: {
    packageJson: {
      packageType: "error",
      main: "error",
      module: "error",
      types: "error",
      exports: "error",
      customElementsProperty: "error",
      publishedCem: "error"
    },
    manifest: {
      schemaVersion: "error",
      modulePath: "error",
      definitionPath: "error",
      typeDefinitionPath: "error",
      exportTypes: "warning",
      tagName: "error"
    }
  }
};

validateCem(manifest, options);
```

### Severity Levels

Each rule supports three severity levels:

- **`"off"`** - Disables the rule completely
- **`"warning"`** - Logs a warning but doesn't fail validation
- **`"error"`** - Fails validation and throws an error (or logs if `logErrors: true`)

```ts
{
  rules: {
    manifest: {
      tagName: "error",        // Fails validation
      exportTypes: "warning",  // Shows warning only
      modulePath: "off"        // Skips this check
    }
  }
}
```

### Type Definitions

```ts
type CemValidatorOptions = {
  /** The path to the `package.json` file */
  packageJsonPath?: string;
  /** Custom Elements Manifest file name */
  cemFileName?: string;
  /** This will log errors rather throw an exception */
  logErrors?: boolean;
  /** List of classes to exclude from validation */
  exclude?: string[];
  /** Enables logging during the component loading process */
  debug?: boolean;
  /** Prevents plugin from executing */
  skip?: boolean;
  /** Rule configurations */
  rules?: Rules;
};

/** The severity level for each rule */
type Severity = "off" | "warning" | "error";

type Rules = {
  /** Checks if the package.json file is appropriately configured */
  packageJson?: {
    /** Is `type` property set to "module" */
    packageType?: Severity;
    /** Is `main` property set with a valid file path */
    main?: Severity;
    /** Is `module` property set with a valid file path */
    module?: Severity;
    /** Is `types` property set with a valid file path */
    types?: Severity;
    /** Does the package have a `exports` property configured */
    exports?: Severity;
    /** Is the `customElements` property properly configured */
    customElementsProperty?: Severity;
    /** Is the Custom Elements Manifest included in the published package */
    publishedCem?: Severity;
  };
  /** Checks if the `customElementsManifest` is valid */
  manifest?: {
    /** Is the manifest using the latest schema version */
    schemaVersion?: Severity;
    /** Does the component have a valid module path */
    modulePath?: Severity;
    /** Does the component have a valid definition path */
    definitionPath?: Severity;
    /** Does the element have a valid type definition path */
    typeDefinitionPath?: Severity;
    /** Does the component export all necessary types */
    exportTypes?: Severity;
    /** Does the component have a tag name defined */
    tagName?: Severity;
  };
};
```

<!-- <div style="text-align: center; margin-top: 32px;">
  <a href="https://stackblitz.com/edit/stackblitz-starters-57ju3afb?file=README.md" target="_blank">
    <img
      alt="Open in StackBlitz"
      src="https://developer.stackblitz.com/img/open_in_stackblitz.svg"
    />
  </a>
</div> -->

Check out the [documentation](https://wc-toolkit.com/cem-utilities/cem-validator) to see how to configure this to meet your project's needs.
