import {
   writable as ogWritable,
   get } from 'svelte/store';

import {
   is_function,
   noop,
   run_all }      from 'svelte/internal';

import type {
   Invalidator,
   Readable,
   StartStopNotifier,
   Subscriber,
   Unsubscriber,
   Updater,
   Writable }     from 'svelte/store';

/** One or more `Readable`s. */
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];

/** One or more values from `Readable` stores. */
type StoresValues<T> = T extends Readable<infer U> ? U : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

type SimpleDeriver<T, U> = (values: StoresValues<T>) => U
type AdvancedDeriver<T, U> = (values: StoresValues<T>, set: Subscriber<U>) => Unsubscriber | void
type Deriver<T, U> = SimpleDeriver<T, U> | AdvancedDeriver<T, U>

function isSimpleDeriver<T, U>(deriver: Deriver<T, U>): deriver is SimpleDeriver<T, U>
{
   return deriver.length < 2;
}

export type StoreModule = {
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
   readable: <T>(key: string, value: T, start: StartStopNotifier<T>) => Readable<T>;

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
   writable: <T>(key: string, value: T, start?: StartStopNotifier<T>) => Writable<T>;

   /**
    * @template S, U
    *
    * Derived value store by synchronizing one or more readable stores and applying an aggregation function over its
    * input values.
    *
    * @param {string}   key - Storage key.
    *
    * @param {S}        stores - Input stores.
    *
    * @param {Deriver<S, U>}  fn - Function callback that aggregates the values.
    *
    * @param {U}        [initial_value] When used asynchronously.
    *
    * @returns {Readable<U>} A derived storage store.
    */
   derived: <S extends Stores, U>(key: string, stores: S, fn: Deriver<S, U>, initial_value?: U) => Readable<U>;
}

export function generator(storage: Storage): StoreModule
{
   function readable<T>(key: string, value: T, start: StartStopNotifier<T>): Readable<T>
   {
      return {
         subscribe: writable(key, value, start).subscribe
      }
   }

   function writable<T>(key: string, value: T, start: StartStopNotifier<T> = noop): Writable<T>
   {
      function wrap_start(ogSet: Subscriber<T>)
      {
         return start(function wrap_set(new_value: T)
            {
               if (storage) { storage.setItem(key, JSON.stringify(new_value)); }
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
            if (storageValue) { value = JSON.parse(storageValue); }
         }
         catch (err) { /**/ }

         storage.setItem(key, JSON.stringify(value));
      }

      const ogStore = ogWritable(value, start ? wrap_start : undefined);

      function set(new_value: T): void
      {
         if (storage) { storage.setItem(key, JSON.stringify(new_value)); }
         ogStore.set(new_value);
      }

      function update(fn: Updater<T>): void
      {
         set(fn(get(ogStore)));
      }

      function subscribe(run: Subscriber<T>, invalidate: Invalidator<T> = noop): Unsubscriber
      {
         return ogStore.subscribe(run, invalidate);
      }

      return { set, update, subscribe };
   }

   function derived<S extends Stores, U>(key: string, stores: S, fn: Deriver<S, U>, initial_value?: U): Readable<U>
   {
      const single = !Array.isArray(stores);
      const stores_array: Array<Readable<any>> = single ? [stores as Readable<any>] : stores as Array<Readable<any>>;

      if (storage && storage.getItem(key))
      {
         try
         {
            initial_value = JSON.parse(storage.getItem(key));
         }
         catch (err) { /**/ }
      }

      return readable(key, initial_value, (set) =>
      {
         let inited = false;
         const values: StoresValues<S> = [] as StoresValues<S>;

         let pending = 0;
         let cleanup = noop;

         const sync = () =>
         {
            if (pending) { return; }

            cleanup();
            const input: StoresValues<S> = single ? values[0] : values;

            if (isSimpleDeriver(fn))
            {
               set(fn(input));
            }
            else
            {
               const result = fn(input, set);
               cleanup = is_function(result) ? result as Unsubscriber : noop;
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
            run_all(unsubscribers);
            cleanup();
         }
      });
   }

   return {
      readable,
      writable,
      derived
   }
}
