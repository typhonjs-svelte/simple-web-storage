import {
   inflateAndUnpackB64,
   packAndDeflateB64 }     from '@typhonjs-svelte/runtime-base/data/format/msgpack/compress';

import { storeGenerator }  from '../../src/generator';

// Default export specifically for testing setup.
export default {
   ...storeGenerator({
      storage: globalThis?.localStorage,
      serialize: packAndDeflateB64,
      deserialize: inflateAndUnpackB64
   }),
   deserialize: inflateAndUnpackB64
}
