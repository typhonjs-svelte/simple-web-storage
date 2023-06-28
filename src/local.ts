import {
   generator,
   StoreModule }  from './generator.js';

const storage: Storage = typeof globalThis?.localStorage !== 'undefined' ? globalThis.localStorage : undefined;

const g: StoreModule = generator(storage);

export const readable = g.readable;
export const writable = g.writable;
export const derived = g.derived;