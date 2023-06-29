# Changelog
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
