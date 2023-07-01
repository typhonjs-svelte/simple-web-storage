import {
   storeGenerator,
   StorageDerived,
   StorageReadable,
   StorageWritable } from '#simple-web-storage/generator';

/**
 * Provides all Storage API enabled `sessionStorage` helper functions. Data is serialized as JSON.
 */
export const sessionStores = storeGenerator({ storage: globalThis?.sessionStorage });

/**
 * Provides the Storage API enabled derived `sessionStorage` helper function. Data is serialized as JSON.
 */
export const derived: StorageDerived = sessionStores.derived;

/**
 * Provides the Storage API enabled readable `sessionStorage` helper function. Data is serialized as JSON.
 */
export const readable: StorageReadable = sessionStores.readable;

/**
 * Provides the Storage API enabled writable `sessionStorage` helper function. Data is serialized as JSON.
 */
export const writable: StorageWritable = sessionStores.writable;