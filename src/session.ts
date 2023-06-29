import {
   generator,
   GeneratorStores,
   StorageDerived,
   StorageReadable,
   StorageWritable } from './generator.js';

const storage: Storage = typeof globalThis?.sessionStorage !== 'undefined' ? globalThis.sessionStorage : undefined;

const g: GeneratorStores = generator({ storage });

export const readable: StorageReadable = g.readable;
export const writable: StorageWritable = g.writable;
export const derived: StorageDerived = g.derived;