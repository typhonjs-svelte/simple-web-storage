import {
   inflateAndUnpackB64,
   packAndDeflateB64 }     from '@typhonjs-svelte/runtime-base/data/format/msgpack/compress';

import { storeGenerator }  from '../../src/generator';

const localMsgPackStores = {
   ...storeGenerator({
      storage: globalThis?.localStorage,
      serialize: packAndDeflateB64,
      deserialize: inflateAndUnpackB64
   }),
   deserialize: inflateAndUnpackB64
};

const sessionMsgPackStores = {
   ...storeGenerator({
      storage: globalThis?.sessionStorage,
      serialize: packAndDeflateB64,
      deserialize: inflateAndUnpackB64
   }),
   deserialize: inflateAndUnpackB64
};

export { localMsgPackStores, sessionMsgPackStores }

