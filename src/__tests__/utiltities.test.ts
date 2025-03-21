import { describe, expect, test } from "vitest";
import { isLatestPackageVersion, isValidFilePath } from "../utilities";

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

    test("should return `false` with invalid file paths", async () => {
      // Arrange
      const filePath = "src/index.js";
      
      // Act
      const isValid = isValidFilePath(filePath);

      // Assert
      expect(isValid).toBeFalsy();
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
});
