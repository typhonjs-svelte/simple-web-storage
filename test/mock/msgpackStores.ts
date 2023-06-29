import {
   inflateAndUnpackB64,
   packAndDeflateB64 }  from '@typhonjs-svelte/runtime-base/data/format/msgpack/compress';

import {
   generator,
   GeneratorStores }    from '../../src/generator';

const storage: Storage = typeof globalThis?.localStorage !== 'undefined' ? globalThis.localStorage : undefined;

const g: GeneratorStores = generator({ storage, serialize: packAndDeflateB64, deserialize: inflateAndUnpackB64 });

// Default export specifically for testing setup.
export default {
   ...g,
   deserialize: inflateAndUnpackB64
}
