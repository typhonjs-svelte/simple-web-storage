# Changelog
## Release 0.5.0 (minor)
- 100% test coverage
- Added API documentation

## Release 0.4.0 (medium)
- Refined type declarations 
  - Added `StorageStores` type alias for output of `storeGenerator`.
- `storeGenerator` now adds the `storage`, `deserialize`, and `serialize` data to output of `storeGenerator`
  - This allows easier downstream overriding of any management code where a serialization strategy can be changed for 
    a single instance of store creation.

## Release 0.3.2 (minor)
- Small JSDoc template fix / comments.

## Release 0.3.0 (major)
- Refined API 
  - `generator` function renamed `storeGenerator`.
  - Both `local` and `session` sub-path exports provide a new combined export `localStores` and `sessionStores` 
    respectively allowing more flexible consumption of this package.
  - Default package export now exports `localStores` and `sessionStores`.
- Cleaned up the types generated avoiding duplication of types across sub-path exports.
- More comments.

## Release 0.2.0 (major)
- Added `generator` to `exports` in `package.json` allowing external customization.
- Upgraded `generator` to accept custom `serializer` and `deserializer` functions to change the serialization strategy 
from default JSON serialization.
- Tests upgraded to test custom serialization w/ compressed MessagePack to base64 strings.
  - For testing this does use features from [@typhonjs-svelte/runtime-base](https://github.com/typhonjs-svelte/runtime-base). 

## Release 0.1.0 (initial)
- Initial refactor of [svelte-persistent-store](https://www.npmjs.com/package/svelte-persistent-store) for Svelte v4.
- Same API / features just code and tests cleaned up w/ Svelte v4+ support.
- Proper `exports` and types in `package.json`.
