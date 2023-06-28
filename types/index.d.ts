import * as svelte_store from 'svelte/store';

declare const readable: <T>(key: string, value: T, start: svelte_store.StartStopNotifier<T>) => svelte_store.Readable<T>;
declare const writable: <T>(key: string, value: T, start?: svelte_store.StartStopNotifier<T>) => svelte_store.Writable<T>;
declare const derived: <S extends svelte_store.Readable<any> | [svelte_store.Readable<any>, ...svelte_store.Readable<any>[]], U>(key: string, stores: S, fn: ((values: S extends svelte_store.Readable<infer U_1> ? U_1 : { [K in keyof S]: S[K] extends svelte_store.Readable<infer U_2> ? U_2 : never; }) => U) | ((values: S extends svelte_store.Readable<infer U_1> ? U_1 : { [K in keyof S]: S[K] extends svelte_store.Readable<infer U_2> ? U_2 : never; }, set: svelte_store.Subscriber<U>) => void | svelte_store.Unsubscriber), initial_value?: U) => svelte_store.Readable<U>;

export { derived, readable, writable };
