![@typhonjs-svelte/simple-web-storage](https://i.imgur.com/f5Qm8OC.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-svelte/simple-web-storage.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-svelte/simple-web-storage)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-svelte/simple-web-storage/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://discord.gg/mnbgN8f)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

[![Build Status](https://github.com/typhonjs-svelte/simple-web-storage/workflows/CI/CD/badge.svg)](#)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-svelte/simple-web-storage.svg)](https://codecov.io/github/typhonjs-svelte/simple-web-storage)

Provides a simple set of [Svelte store](https://svelte.dev/docs#svelte_store) functions to connect Svelte w/ the 
browser web storage API. This package is a maintained hard fork of 
[svelte-persistent-stores](https://www.npmjs.com/package/svelte-persistent-store) for Svelte v4+. The primary reason to 
choose this package over alternatives is that it accomplishes the task in 125 lines of code w/ no dependencies besides 
Svelte.

## Usage

Persist to [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

```js
import { writable, readable, derived } from '@typhonjs-svelte/simple-web-storage/local';

const count = writable('count', 0);

count.set(1);
```

Persist to [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

```js
import { writable, readable, derived } from '@typhonjs-svelte/simple-web-storage/session';

const count = writable('count', 0);

count.set(1);
```

## API

The stores provided have the same signature as the Svelte store helper functions except the first argument is the 
string `key` used by `localStorage` and `sessionStorage` to store and retrieve the value. The 
[Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface specification only allows string values 
therefore this library serializes stored values as JSON.

## Other Svelte web storage packages

For more comprehensive solutions that are a bit more heavyweight check out:
- [@macfja/svelte-persistent-store](https://www.npmjs.com/package/@macfja/svelte-persistent-store)
- [Dexie.js (IndexedDB)](https://dexie.org/)