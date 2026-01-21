/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from "vitest";
import { isLatestPackageVersion, isValidFilePath, isNativeJSType, extractCustomEventType, extractNamedTypes, isExportableTypeName, getMissingExportedTypes } from "../utilities";

describe("Utilities", () => {
  describe("isValidFilePath", () => {
    test("should return `true` with unix file paths", async () => {
      // Arrange
      const filePath = "./src/index.js";

      // Act
      const isValid = isValidFilePath(filePath);

      // Assert
      expect(isValid).toBeTruthy();
    });

    test("should return `true` with Windows file paths", async () => {
      // Arrange
      const filePath = `.\\src\\index.js`;

      // Act
      const isValid = isValidFilePath(filePath);

      // Assert
      expect(isValid).toBeTruthy();
    });

    test("should return `false` with globby file paths", async () => {
      // Arrange
      const filePath = "./src/**.js";

      // Act
      const isValid = isValidFilePath(filePath);

      // Assert
      expect(isValid).toBeFalsy();
    });
  });

  describe("isLatestPackageVersion", () => {
    test("should return `true` when `currentVersion` is same version", async () => {
      // Arrange
      const currentVersion = "2.1.0";
      const latestVersion = "2.1.0";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeTruthy();
    });

    test("should return `true` when `currentVersion` is greater major version", async () => {
      // Arrange
      const currentVersion = "3.1.0";
      const latestVersion = "2.1.0";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeTruthy();
    });

    test("should return `true` when `currentVersion` is greater minor version", async () => {
      // Arrange
      const currentVersion = "2.2.0";
      const latestVersion = "2.1.0";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeTruthy();
    });

    test("should return `true` when `currentVersion` is greater patch version", async () => {
      // Arrange
      const currentVersion = "2.1.1";
      const latestVersion = "2.1.0";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeTruthy();
    });

    test("should return `false` when `latestVersion` is greater major version", async () => {
      // Arrange
      const currentVersion = "1.1.0";
      const latestVersion = "2.1.0";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeFalsy();
    });

    test("should return `false` when `latestVersion` is greater minor version", async () => {
      // Arrange
      const currentVersion = "2.2.0";
      const latestVersion = "2.3.0";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeFalsy();
    });

    test("should return `false` when `latestVersion` is greater patch version", async () => {
      // Arrange
      const currentVersion = "2.1.1";
      const latestVersion = "2.1.2";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeFalsy();
    });

    test("should return `true` when `currentVersion` is greater version and `beta`", async () => {
      // Arrange
      const currentVersion = "3.1.1-beta.1";
      const latestVersion = "2.1.2";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeTruthy();
    });

    test("should return `false` when `currentVersion` is same version but `beta`", async () => {
      // Arrange
      const currentVersion = "2.1.1-beta.1";
      const latestVersion = "2.1.1";

      // Act
      const isLatest = isLatestPackageVersion(currentVersion, latestVersion);

      // Assert
      expect(isLatest).toBeFalsy();
    });
  });

  describe("isNativeJSType", () => {
    test("should return true for primitive types", () => {
      expect(isNativeJSType("string")).toBeTruthy();
      expect(isNativeJSType("number")).toBeTruthy();
      expect(isNativeJSType("boolean")).toBeTruthy();
      expect(isNativeJSType("undefined")).toBeTruthy();
      expect(isNativeJSType("null")).toBeTruthy();
    });

    test("should return true for built-in objects", () => {
      expect(isNativeJSType("Object")).toBeTruthy();
      expect(isNativeJSType("Array")).toBeTruthy();
      expect(isNativeJSType("Date")).toBeTruthy();
      expect(isNativeJSType("Promise")).toBeTruthy();
      expect(isNativeJSType("Map")).toBeTruthy();
      expect(isNativeJSType("Set")).toBeTruthy();
    });

    test("should return true for DOM types", () => {
      expect(isNativeJSType("HTMLElement")).toBeTruthy();
      expect(isNativeJSType("Element")).toBeTruthy();
      expect(isNativeJSType("Node")).toBeTruthy();
      expect(isNativeJSType("Document")).toBeTruthy();
    });

    test("should return true for event types", () => {
      expect(isNativeJSType("MouseEvent")).toBeTruthy();
      expect(isNativeJSType("KeyboardEvent")).toBeTruthy();
      expect(isNativeJSType("FocusEvent")).toBeTruthy();
      expect(isNativeJSType("Event")).toBeTruthy();
      expect(isNativeJSType("CustomEvent")).toBeTruthy();
    });

    test("should return true for array types", () => {
      expect(isNativeJSType("string[]")).toBeTruthy();
      expect(isNativeJSType("number[]")).toBeTruthy();
      expect(isNativeJSType("Array[]")).toBeTruthy();
    });

    test("should return true for generic types", () => {
      expect(isNativeJSType("Promise<string>")).toBeTruthy();
      expect(isNativeJSType("Set<boolean>")).toBeTruthy();
      expect(isNativeJSType("Array<number>")).toBeTruthy();
    });

    test("should return true for union types with all native types", () => {
      expect(isNativeJSType("string | number")).toBeTruthy();
      expect(isNativeJSType("boolean | undefined")).toBeTruthy();
      expect(isNativeJSType("Element | null")).toBeTruthy();
    });

    test("should return true for function types", () => {
      expect(isNativeJSType("() => void")).toBeTruthy();
      expect(isNativeJSType("(arg: string) => number")).toBeTruthy();
    });

    test("should return false for custom types", () => {
      expect(isNativeJSType("MyCustomType")).toBeFalsy();
      expect(isNativeJSType("UserProfile")).toBeFalsy();
      expect(isNativeJSType("ComponentOptions")).toBeFalsy();
    });

    test("should return false for union types with custom types", () => {
      expect(isNativeJSType("string | MyCustomType")).toBeFalsy();
      expect(isNativeJSType("number | UserProfile")).toBeFalsy();
    });

    test("should return false for empty string", () => {
      expect(isNativeJSType("")).toBeFalsy();
    });
  });

  describe("extractCustomEventType", () => {
    test("should extract type from CustomEvent generic", () => {
      expect(extractCustomEventType("CustomEvent<MyEventDetail>")).toBe("MyEventDetail");
      expect(extractCustomEventType("CustomEvent<UserData>")).toBe("UserData");
    });

    test("should return original value for non-CustomEvent types", () => {
      expect(extractCustomEventType("MouseEvent")).toBe("MouseEvent");
      expect(extractCustomEventType("string")).toBe("string");
      expect(extractCustomEventType("MyCustomType")).toBe("MyCustomType");
    });

    test("should return empty string for undefined", () => {
      expect(extractCustomEventType(undefined)).toBe("");
      expect(extractCustomEventType("")).toBe("");
    });

    test("should handle complex generic types", () => {
      expect(extractCustomEventType("CustomEvent<{ id: string; name: string }>")).toBe("{ id: string; name: string }");
    });
  });

  describe("extractNamedTypes", () => {
    test("should extract names from function types", () => {
      expect(
        extractNamedTypes(
          "(option: WaOption, index: number) => TemplateResult | string | HTMLElement",
        ),
      ).toEqual(expect.arrayContaining(["WaOption", "TemplateResult", "string", "HTMLElement"]));
    });

    test("should treat array types as base names", () => {
      expect(extractNamedTypes("WaOption[]")).toEqual(["WaOption"]);
    });

    test("should ignore object literal members", () => {
      expect(
        extractNamedTypes("{ top: number; left: number } | undefined"),
      ).toEqual(["undefined"]);
    });
  });

  describe("isExportableTypeName", () => {
    test("should return false for native and ignored types", () => {
      expect(isExportableTypeName("string")).toBeFalsy();
      expect(isExportableTypeName("HTMLElement")).toBeFalsy();
      expect(isExportableTypeName("CustomEvent")).toBeFalsy();
      expect(isExportableTypeName("TemplateResult")).toBeFalsy();
    });

    test("should return true for custom types", () => {
      expect(isExportableTypeName("WaOption")).toBeTruthy();
      expect(isExportableTypeName("MyCustomType")).toBeTruthy();
    });
  });

  describe("getMissingExportedTypes", () => {
    test("should return missing types for component references", () => {
      const component = {
        events: [{ type: { text: "CustomEvent<WaEventDetail>" } }],
        members: [],
      } as any;

      const exports = ["WaOption"];
      const missing = getMissingExportedTypes(component, exports);
      expect(missing).toContain("WaEventDetail");
      expect(missing).not.toContain("WaOption");
    });
  });
});
