![@typhonjs-svelte/simple-web-storage](https://i.imgur.com/f5Qm8OC.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-svelte/simple-web-storage.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-svelte/simple-web-storage)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-svelte/simple-web-storage/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://discord.gg/mnbgN8f)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

[![Build Status](https://github.com/typhonjs-svelte/simple-web-storage/workflows/CI/CD/badge.svg)](#)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-svelte/simple-web-storage.svg)](https://codecov.io/github/typhonjs-svelte/simple-web-storage)

Provides a set of [Svelte store](https://svelte.dev/docs#svelte_store) helper functions to connect Svelte w/ the 
browser web [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) API. This package is an evolution of 
[svelte-persistent-stores](https://www.npmjs.com/package/svelte-persistent-store) for Svelte v4+. The primary reason to 
choose this package over alternatives is that it accomplishes the task in ~100 source lines of code w/ no dependencies 
besides Svelte.

## Usage

Persist to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

```js
import { writable, readable, derived } from '@typhonjs-svelte/simple-web-storage/local';

// The first argument is the storage key followed by any default value.
const count = writable('count', 0);

count.set(1);
```

Persist to [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

```js
import { writable, readable, derived } from '@typhonjs-svelte/simple-web-storage/session';

// The first argument is the storage key followed by any default value.
const count = writable('count', 0);

count.set(1);
```

The named exports from the main package export provides `localStores` / `sessionStores` respectively containing 
`derived` / `readable` / `writable` properties. 

```js
import { localStores, sessionStores } from '@typhonjs-svelte/simple-web-storage';

// The first argument is the storage key followed by any default value.
const localCount = localStores.writable('count', 0);
const sessionCount = sessionStores.writable('count', 0);

localCount.set(1);
sessionCount.set(1);
```

## API

The stores provided have the same signature as the Svelte store helper functions except the first argument is the 
string `key` used by `localStorage` and `sessionStorage` to store and retrieve the value. The 
[Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface specification only allows string values 
therefore this library by default serializes stored values as JSON.

## Advanced API / Customization

The `storeGenerator` function that wraps and creates [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) 
connected stores is available allowing further external customization. You may provide a custom serialization strategy 
that is different from JSON along with providing any Storage API compatible interface besides browser `localStorage` / 
`sessionStorage`. The `serializer` / `deserializer` functions must match the signatures of `JSON.parse` / 
`JSON.stringify`.

The following is a Typescript example for generating storage API compatible stores w/ a customized serialization 
strategy: 
```ts
import {
   storeGenerator,
   StorageDerived,
   StorageReadable,
   StorageWritable } from '@typhonjs-svelte/simple-web-storage/generator';

// The `storage` option for `storeGenerator` must be a Storage API compatible instance.

// Provide a JSON parse / stringify signature compatible functions to modify serialization strategy. 
// const deserialize = ... // (value: string, ...rest: any[]) => any 
// const serialize = ... // (value: any, ...rest: any[]) => string

export const localStores = storeGenerator({ storage: globalThis?.localStorage, serialize, deserialize });

export const derived: StorageDerived = localStores.derived;
export const readable: StorageReadable = localStores.readable;
export const writable: StorageWritable = localStores.writable;
```

Beyond the `derived`, `readable`, and `writable` store helper functions created `storeGenerator` also adds the 
`storage`, `serialize`, and `deserialize` instance / functions to the returned object.

In the package tests the custom serialization strategy tested is compressed MessagePack to base64 data. 


## Other Svelte browser storage packages

For more comprehensive solutions that are a bit more heavyweight check out:
- [@macfja/svelte-persistent-store](https://www.npmjs.com/package/@macfja/svelte-persistent-store)
- [Dexie.js (IndexedDB)](https://dexie.org/)
