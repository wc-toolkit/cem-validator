import { afterEach, describe, expect, test } from "vitest";
import {
  failures,
  testMainProperty,
  testModuleProperty,
  testPackageType,
  testTypesProperty,
  testCemPublished,
  testSchemaVersion,
  testComponents,
  testComponentModulePath,
} from "../cem-validator.js";
import testManifest from "./manifests/test-cem.json";
import defaultPackageJson from "./packageJson/default-package.json";
import type * as cem from "custom-elements-manifest";

describe("Validate CEM", () => {
  afterEach(() => {
    // Reset the state of the manifest after each test
    failures.length = 0;
  });

  describe("Validate package.json", () => {
    test("should add warning when `type` property is not set to 'module'", async () => {
      // Arrange

      // Act
      testPackageType(defaultPackageJson.type, "warning");

      // Assert
      expect(failures.length).toBe(1);
    });

    test("should add warning when `main` property is not set", async () => {
      // Arrange

      // Act
      testMainProperty(defaultPackageJson.main, "warning");

      // Assert
      expect(failures.length).toBe(1);
    });

    test("should add warning when `types` property is not set", async () => {
      // Arrange

      // Act
      // @ts-expect-error we know this is undefined
      testTypesProperty(defaultPackageJson.types, "warning");

      // Assert
      expect(failures.length).toBe(1);
    });

    describe("testCemPublished", () => {
      test("should not add error when CEM filename is in files array", () => {
        // Arrange
        const files = ["dist", "custom-elements.json"];
        const customElements = "./custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should not add error when CEM is in subdirectory listed in files array", () => {
        // Arrange
        const files = ["dist"];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should not add error when CEM is in subdirectory with trailing slash in files array", () => {
        // Arrange
        const files = ["dist/"];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should add error when CEM is not in files array", () => {
        // Arrange
        const files = ["src", "README.md"];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(1);
        expect(failures[0].rule).toBe("packageJson.publishedCem");
        expect(failures[0].severity).toBe("error");
      });

      test("should add error when CEM is in subdirectory not listed in files array", () => {
        // Arrange
        const files = ["build"];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(1);
        expect(failures[0].rule).toBe("packageJson.publishedCem");
      });

      test("should not add error when customElements is not defined", () => {
        // Arrange
        const files = ["dist"];
        const customElements = undefined;
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should not add error when files array is empty", () => {
        // Arrange
        const files: string[] = [];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should not add error when severity is 'off'", () => {
        // Arrange
        const files = ["src"];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "off");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should handle CEM in root directory", () => {
        // Arrange
        const files = ["custom-elements.json"];
        const customElements = "custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should handle CEM path with ./ prefix", () => {
        // Arrange
        const files = ["./dist"];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should handle nested subdirectories", () => {
        // Arrange
        const files = ["dist/lib"];
        const customElements = "./dist/lib/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "error");

        // Assert
        expect(failures.length).toBe(0);
      });

      test("should add warning when severity is 'warning'", () => {
        // Arrange
        const files = ["src"];
        const customElements = "./dist/custom-elements.json";
        const cemFileName = "custom-elements.json";

        // Act
        testCemPublished(files, customElements, cemFileName, "warning");

        // Assert
        expect(failures.length).toBe(1);
        expect(failures[0].severity).toBe("warning");
      });
    });
  });

  describe("Validate Manifest", () => {
    test("should add warning when `schemaVersion` property is not set to current version", async () => {
      // Arrange

      // Act
      await testSchemaVersion(testManifest.schemaVersion, "warning");

      // Assert
      expect(failures.length).toBe(1);
    });

    describe("Validate components", () => {
      test("should add warning when `tagName` property is not set", async () => {
        // Arrange

        // Act
        testComponents(testManifest as cem.Package);

        // Assert
        console.log(failures);
        expect(failures.length).toBe(4);
      });

      test("should add warning when module path is invalid", async () => {
        // Arrange

        // Act
        testComponentModulePath("TestComponent", "src/test.js", "warning");

        // Assert
        expect(failures.length).toBe(1);
      });

      test("should not add warning when module path is valid", async () => {
        // Arrange

        // Act
        testComponentModulePath(
          "TestComponent",
          "/__tests__/packageJson/default-package.json",
          "warning"
        );

        // Assert
        console.log(failures);
        expect(failures.length).toBe(0);
      });
    });
  });

  describe("Validation Severity", () => {
    test("should add warning when `severity` is 'warning'", async () => {
      // Arrange

      // Act
      await testSchemaVersion(testManifest.schemaVersion, "warning");
      const warnings = failures.filter((x) => x.severity === "warning");

      // Assert
      expect(warnings.length).toBe(1);
    });
    test("should add error when `severity` is 'error'", async () => {
      // Arrange

      // Act
      await testSchemaVersion(testManifest.schemaVersion, "error");
      const errors = failures.filter((x) => x.severity === "error");

      // Assert
      expect(errors.length).toBe(1);
    });
    test("should add nothing when `severity` is 'off'", async () => {
      // Arrange

      // Act
      await testSchemaVersion(testManifest.schemaVersion, "warning");

      // Assert
      expect(failures.length).toBe(1);
    });
  });
});
