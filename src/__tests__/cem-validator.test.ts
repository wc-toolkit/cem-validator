import { afterEach, describe, expect, test } from "vitest";
import {
  failures,
  testMainProperty,
  testModuleProperty,
  testPackageType,
  testTypesProperty,
  testCustomElementsProperty,
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

    test("should add warning when `module` property is not set", async () => {
      // Arrange

      // Act
      testModuleProperty(defaultPackageJson.main, "warning");

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

    test("should add warning when `exports` property is not set", async () => {
      // Arrange

      // Act
      // @ts-expect-error we know this is undefined
      testTypesProperty(defaultPackageJson.exports, "warning");

      // Assert
      expect(failures.length).toBe(1);
    });

    test("should add warning when `exports` property is not set", async () => {
      // Arrange

      // Act
      // @ts-expect-error we know this is undefined
      testCustomElementsProperty(defaultPackageJson.customElements, "error");

      // Assert
      expect(failures.length).toBe(1);
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
        expect(failures.length).toBe(5);
      });

      test("should add warning when module path is invalid", async () => {
        // Arrange

        // Act
        testComponentModulePath('TestComponent', 'src/test.js', 'warning');

        // Assert
        expect(failures.length).toBe(1);
      });

      test("should not add warning when module path is valid", async () => {
        // Arrange

        // Act
        testComponentModulePath('TestComponent', '/__tests__/packageJson/default-package.json', 'warning');

        // Assert
        console.log(failures);
        expect(failures.length).toBe(0);
      });
    });
  });
});
