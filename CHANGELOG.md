# @wc-toolkit/cem-validator

## 1.0.4

### Patch Changes

- 615d087: Fixed issue when CEM is included in a directory listed in `files` array, but not explicitly listed
- 615d087: Removed `module` check as that is not a valid property in package.json
- 615d087: Fixed issue when relative path names aren't provided
- 06e638c: Added check to validate `exports` or `main`, but not both
- 615d087: Added check for `browser` property when validating

## 1.0.3

### Patch Changes

- ba66da6: fixed error if no methods, properties, or events exist on components

## 1.0.2

### Patch Changes

- 3dada39: fixed `publishedCem` config

## 1.0.1

### Patch Changes

- 5263799: Added missing `publishedCem` rule
- 3c60b55: fixed severity mapping for `publishedCem`
- 3c60b55: renamed `moduleType` to `packageType`

## 1.0.0

### Major Changes

- 6a973ab: Initial release
