import {
   storeGenerator,
   StorageDerived,
   StorageReadable,
   StorageWritable } from '#simple-web-storage/generator';

/**
 * Provides all Storage API enabled `sessionStorage` stores. Data is serialized as JSON.
 */
export const sessionStores = storeGenerator({ storage: globalThis?.sessionStorage });

/**
 * Provides the Storage API enabled derived `sessionStorage` store. Data is serialized as JSON.
 */
export const derived: StorageDerived = sessionStores.derived;

/**
 * Provides the Storage API enabled readable `sessionStorage` store. Data is serialized as JSON.
 */
export const readable: StorageReadable = sessionStores.readable;

/**
 * Provides the Storage API enabled writable `sessionStorage` store. Data is serialized as JSON.
 */
export const writable: StorageWritable = sessionStores.writable;