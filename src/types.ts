export type CemValidatorOptions = {
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
export type Severity = "off" | "warning" | "error";

export type Rules = {
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

export type RuleFailure = {
  /** The rule that failed */
  rule: string;
  /** The severity of the rule */
  severity: Severity;
  /** The message of the rule */
  message: string;
};
