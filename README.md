<div align="center">
  
![workbench with tools, html, css, javascript, and download icon](https://raw.githubusercontent.com/wc-toolkit/cem-validator/refs/heads/main/assets/wc-toolkit_cem-validator.png)

</div>

# WC Toolkit - CEM Validator

This tool is designed to validate key aspects of your project to ensure accurate documentation and proper integration with tools.


## Installation

To install the package, use the following command:

```bash
npm install -D @wc-toolkit/cem-validator
```

## Usage

This package includes two ways to update the Custom Elements Manifest:

1. using it in a script
2. as a plugin for the [Custom Element Manifest Analyzer](https://custom-elements-manifest.open-wc.org/).

### Script

```ts
// my-script.ts

import { validateCem, type CemValidatorOptions } from "@wc-toolkit/cem-validator";
import manifest from "./path/to/custom-elements.json" with { type: 'json' };

const options: CemValidatorOptions = {...};

validateCem(manifest, options);
```

### CEM Analyzer

The plugin can be added to the [Custom Elements Manifest Analyzer configuration file](https://custom-elements-manifest.open-wc.org/analyzer/config/#config-file).

```js
// custom-elements-manifest.config.js

import { cemValidatorPlugin } from "@wc-toolkit/cem-validator";

const options = {...};

export default {
  plugins: [
    cemValidatorPlugin(options)
  ],
};
```

## Configuration

```ts
type CemValidatorOptions = {
  /** The path to the `package.json` file */
  packageJsonPath?: string;
  /** Custom Elements Manifest file name */
  cemFileName?: string;
  /** This will log errors rather throw an exception */
  logErrors?: boolean;
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
  }
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
  }
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
