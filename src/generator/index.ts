import {
   writable as ogWritable,
   get }             from 'svelte/store';

import type {
   Invalidator,
   Readable,
   StartStopNotifier,
   Stores,
   StoresValues,
   Subscriber,
   Unsubscriber,
   Updater,
   Writable }        from 'svelte/store';

/**
 * Generates derived, readable, writable helper functions wrapping the given Storage API provided with any additional
 * customization for data serialization. By default, JSON serialization is used.
 *
 * @param {object}   opts - Generator options.
 *
 * @param {Storage}  storage - The web storage source.
 *
 * @param {(value: any, ...rest: any[]) => string}  [opts.serialize] - Replace with custom serialization;
 *        default: `JSON.stringify`.
 *
 * @param {(value: string, ...rest: any[]) => any}  [opts.deserialize] - Replace with custom deserialization;
 *        default: `JSON.parse`.
 *
 * @returns {StorageStores} A complete set of store helper functions and associated storage API instance and
 *          serialization strategy.
 */
export function storeGenerator({ storage, serialize = JSON.stringify, deserialize = JSON.parse }:
 { storage: Storage, serialize?: (value: any, ...rest: any[]) => string,
   deserialize?: (value: string, ...rest: any[]) => any }): StorageStores
{
   function isSimpleDeriver<S extends Stores, T>(deriver: Deriver<S, T>): deriver is SimpleDeriver<S, T>
   {
      return deriver.length < 2;
   }

   function storageReadable<T>(key: string, value: T, start: StartStopNotifier<T>): Readable<T>
   {
      return {
         subscribe: storageWritable(key, value, start).subscribe
      }
   }

   function storageWritable<T>(key: string, value: T, start?: StartStopNotifier<T>): Writable<T>
   {
      function wrap_start(ogSet: Subscriber<T>)
      {
         return start(function wrap_set(new_value: T)
            {
               if (storage) { storage.setItem(key, serialize(new_value)); }
               return ogSet(new_value)
            },
            function wrap_update(fn: Updater<T>)
            {
               set(fn(get(ogStore)));
            }
         );
      }

      if (storage)
      {
         const storageValue = storage.getItem(key);

         try
         {
            if (storageValue) { value = deserialize(storageValue); }
         }
         catch (err) { /**/ }

         storage.setItem(key, serialize(value));
      }

      const ogStore = ogWritable(value, start ? wrap_start : void 0);

      function set(new_value: T): void
      {
         if (storage) { storage.setItem(key, serialize(new_value)); }
         ogStore.set(new_value);
      }

      function update(fn: Updater<T>): void
      {
         set(fn(get(ogStore)));
      }

      function subscribe(run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber
      {
         return ogStore.subscribe(run, invalidate);
      }

      return { set, update, subscribe };
   }

   function storageDerived<S extends Stores, T>(key: string, stores: S, fn: Deriver<S, T>, initial_value?: T):
    Readable<T>
   {
      const single = !Array.isArray(stores);
      const stores_array: Array<Readable<any>> = single ? [stores as Readable<any>] : stores as Array<Readable<any>>;

      if (storage && storage.getItem(key))
      {
         try
         {
            initial_value = deserialize(storage.getItem(key));
         }
         catch (err) { /**/ }
      }

      return storageReadable(key, initial_value, (set, update) =>
      {
         let inited = false;
         const values: StoresValues<S> = [] as StoresValues<S>;

         let pending = 0;
         let cleanup;

         const sync = () =>
         {
            if (pending) { return; }

            cleanup?.();
            const input: StoresValues<S> = single ? values[0] : values;

            if (isSimpleDeriver(fn))
            {
               set(fn(input));
            }
            else
            {
               const result = fn(input, set, update);
               if (typeof result === 'function') { cleanup = result as Unsubscriber; }
            }
         };

         const unsubscribers = stores_array.map((store, i) => store.subscribe((value) =>
            {
               values[i] = value;
               pending &= ~(1 << i);
               if (inited) { sync(); }
            },
            () => { pending |= (1 << i); }),
         );

         inited = true;
         sync();

         return function stop()
         {
            // Equivalent to run_all from Svelte internals.
            unsubscribers.forEach((unsubscriber) => unsubscriber());
            cleanup?.();
         }
      });
   }

   return {
      readable: storageReadable,
      writable: storageWritable,
      derived: storageDerived,

      storage,
      serialize,
      deserialize
   }
}

// Types -------------------------------------------------------------------------------------------------------------

type AdvancedDeriver<S extends Stores, T> = (values: StoresValues<S>, set: Subscriber<T>,
 update: (fn: Updater<T>) => void) => Unsubscriber | void;

type Deriver<S extends Stores, T> = SimpleDeriver<S, T> | AdvancedDeriver<S, T>;

type SimpleDeriver<S extends Stores, T> = (values: StoresValues<S>) => T;

/**
 * @template S, T
 *
 * Derived value store by synchronizing one or more readable stores and applying an aggregation function over its
 * input values.
 *
 * @param {string}   key - Storage key.
 *
 * @param {S}        stores - Input stores.
 *
 * @param {Deriver<S, T>}  fn - Function callback that aggregates the values.
 *
 * @param {T}        [initial_value] When used asynchronously.
 *
 * @returns {Readable<T>} A derived storage store.
 */
export type StorageDerived = <S extends Stores, T>(key: string, stores: S, fn: Deriver<S, T>, initial_value?: T) =>
 Readable<T>;

/**
 * @template T
 * Creates a `Readable` store that allows reading by subscription.
 *
 * @param {string}   key - storage key
 *
 * @param {T}        value -  initial value
 *
 * @param {StartStopNotifier<T>} start - Start and stop notifications for subscriptions.
 *
 * @returns {Readable<T>} A readable storage store.
 */
export type StorageReadable = <T>(key: string, value: T, start: StartStopNotifier<T>) => Readable<T>;

/**
 * @template T
 * Create a `Writable` store that allows both updating and reading by subscription.
 *
 * @param {string}   key - Storage key.
 *
 * @param {T}        value - Default value.
 *
 * @param {StartStopNotifier<T>} [start] - Start and stop notifications for subscriptions.
 *
 * @returns {Writable<T>} A writable storage store.
 */
export type StorageWritable = <T>(key: string, value: T, start?: StartStopNotifier<T>) => Writable<T>;


/**
 * The generated web storage store helper functions along with the associated storage API source and serialization
 * strategy.
 */
export type StorageStores = {
   derived: StorageDerived
   readable: StorageReadable
   writable: StorageWritable,

   storage: Storage,
   serialize: (value: any, ...rest: any[]) => string,
   deserialize: (value: string, ...rest: any[]) => any
};