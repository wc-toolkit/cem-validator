import { validateCem } from "./cem-validator.js";
import type { PackageLinkPhaseParams } from "@custom-elements-manifest/analyzer";
import type { CemValidatorOptions } from "./types.js";

export function cemValidatorPlugin(options: CemValidatorOptions = {}) {
  return {
    name: "@wc-toolkit/cem-validator",
    packageLinkPhase({ customElementsManifest }: PackageLinkPhaseParams) {
      validateCem(customElementsManifest, options);
    },
  };
}
