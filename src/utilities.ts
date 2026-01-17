export function isValidFilePath(filePath: string): boolean {
  const regex = /^(\/|\.\/|\.\.\/|[a-zA-Z]:[\\/]|\.\\|\.\.\\)?([a-zA-Z0-9_\-./\\]+)$/;
  return regex.test(filePath);
}

export function isLatestPackageVersion(
  currentVersion: string,
  latestVersion: string
): boolean {
  const isAlphaOrBeta = currentVersion.includes("-");
  const parseVersion = (version: string) => version.split(".").map(x => parseInt(x));

  const [currMajor, currMinor, currPatch] = parseVersion(currentVersion);
  const [latestMajor, latestMinor, latestPatch] = parseVersion(latestVersion);

  if (currMajor !== latestMajor) {
    return currMajor > latestMajor;
  }
  if (currMinor !== latestMinor) {
    return currMinor > latestMinor;
  }
  if (currPatch !== latestPatch) {
    return currPatch > latestPatch;
  }
  if (currPatch !== latestPatch && isAlphaOrBeta) {
    return currPatch > latestPatch;
  }
  return !isAlphaOrBeta;
}
