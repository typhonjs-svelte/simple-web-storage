import {
   storeGenerator,
   StorageDerived,
   StorageReadable,
   StorageWritable } from '#simple-web-storage/generator';

/**
 * Provides all Storage API enabled `localStorage` stores. Data is serialized as JSON.
 */
export const localStores = storeGenerator({ storage: globalThis?.localStorage });

/**
 * Provides the Storage API enabled derived `localStorage` store. Data is serialized as JSON.
 */
export const derived: StorageDerived = localStores.derived;

/**
 * Provides the Storage API enabled readable `localStorage` store. Data is serialized as JSON.
 */
export const readable: StorageReadable = localStores.readable;

/**
 * Provides the Storage API enabled writable `localStorage` store. Data is serialized as JSON.
 */
export const writable: StorageWritable = localStores.writable;
