import {
   generator,
   GeneratorStores,
   StorageDerived,
   StorageReadable,
   StorageWritable } from './generator.js';

const storage: Storage = typeof globalThis?.localStorage !== 'undefined' ? globalThis.localStorage : undefined;

const g: GeneratorStores = generator({ storage });

export const readable: StorageReadable = g.readable;
export const writable: StorageWritable = g.writable;
export const derived: StorageDerived = g.derived;