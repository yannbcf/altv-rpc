# @yannbcf/altv-rpc

## 0.5.0-alpha.2

### Patch Changes

- Move rpc args to the context, thanks to Leon for the idea
- Implement rpcs namespace merging

## 0.5.0-alpha.0

### Minor Changes

- Eradicate < 0.5.0 rpc implementation
- New rpc system wip implementation

### Patch Changes

- Make rpcs non-lazy, it will drastically improve performances and allow bridge events to work
- Various rpcs build steps improvements
- Implement webview bi-directional communication
- Throw an error on multiple rpc return value calls

## 0.4.7

### Patch Changes

- Implement self rpc removal mechanism

## 0.4.6

### Patch Changes

- Fix library types

## 0.4.5

### Patch Changes

- Replace $client and $server with the useTypes method, which remove the useage of subpath imports

## 0.4.3

### Patch Changes

- Expose ClientEvent and ServerEvent types, allowing external type inference

## 0.4.2

### Patch Changes

- Fix library types

## 0.4.1

### Patch Changes

- Implement useEvents which add support for the alt:V local events

## 0.4.0

### Minor Changes

- Add rpc contract internal event name generator function support

### Patch Changes

- Add local events support

## 0.3.6

### Patch Changes

- Add $shared type checking

## 0.3.5

### Patch Changes

- Fix $client and $server subpath exports

## 0.3.4

### Patch Changes

- Fix library exports

## 0.3.1

### Patch Changes

- Isolate $client and $server to unlock alt types runtime type checking

## 0.3.0

### Minor Changes

- Implement rpc handler level runtime type checking
- Implement contract level type checking

### Patch Changes

- Add rpc router return value runtime type checking

## 0.2.0

### Minor Changes

- Implement $typeOnly method

## 0.1.1

### Patch Changes

- Fix package types

## 0.1.0

### Minor Changes

- Restructure the library exports

### Patch Changes

- Implement an event name override system
- Expose zod compatible alt:V classes

## 0.0.4

### Patch Changes

- Improve types inference when no args/returns schema is provided
- Apply the rpc router env correctly
- Allow only 1 return value per rpc call

## 0.0.3

### Patch Changes

- Fix the rpc router protocol return value type inference

## 0.0.1 - 0.0.2

### Patch Changes

- Types fixes, add the return value as a method passed in the router handler args rather than a return statement
