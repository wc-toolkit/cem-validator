# @wc-toolkit/cem-validator

## 1.3.0

### Minor Changes

- 65863d1: Added `exclude` type to exclude a list of classes from evaluation
- 65863d1: Added a typescript type generator instead of manually maintaining a list

### Patch Changes

- 5e2b38d: Updated types to skip during evaluation

## 1.2.1

### Patch Changes

- 357ab8b: Updated type scheck to ignore object literals

## 1.2.0

### Minor Changes

- 196a513: Added validation for complex types like function parameters

### Patch Changes

- 196a513: Fixed issue where array types were not correctly validated
- 196a513: Added performance improvements

## 1.1.0

### Minor Changes

- 0fcb64b: Added native JS type chacks to prevent false errors

### Patch Changes

- 0fcb64b: Fixed component definition path check
- 0fcb64b: Updated color logging for errors
- 0fcb64b: Fixed timing issue for CEM validation

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
