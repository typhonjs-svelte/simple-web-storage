import './mock/localStorage';

import msgpackStores from './mock/msgpackStores';

import {
   derived,
   readable,
   writable }        from '../src/local';

import { get }       from 'svelte/store';

const versions = [
   { name: 'JSON', derived, readable, writable, deserialize: JSON.parse },
   { name: 'MessagePack', ...msgpackStores }
];

beforeEach(() => globalThis.localStorage.clear());

for (const version of versions)
{
   describe(`Stores; version: ${version.name}`, () =>
   {
      describe('writable', () =>
      {
         it('creates a writable store', () =>
         {
            const count = version.writable('count', 0);
            const values = [];

            const unsubscribe = count.subscribe((value) => values.push(value));

            count.set(1);
            count.update(n => n + 1);

            unsubscribe();

            count.set(3);
            count.update(n => n + 1);

            assert.deepStrictEqual(values, [0, 1, 2]);
         });

         it('calls provided subscribe handler', () =>
         {
            let called = 0;

            const store = version.writable('store', 0, () =>
            {
               called += 1;
               return () => called -= 1;
            });

            const unsubscribe1 = store.subscribe(() => void 0);
            assert.strictEqual(called, 1);

            const unsubscribe2 = store.subscribe(() => void 0);
            assert.strictEqual(called, 1);

            unsubscribe1();
            assert.strictEqual(called, 1);

            unsubscribe2();
            assert.strictEqual(called, 0);
         });

         it('does not assume immutable data', () =>
         {
            const obj = {};
            let called = 0;

            const store = version.writable('store', obj);

            store.subscribe(() => called += 1);

            store.set(obj);
            assert.strictEqual(called, 2);

            store.update(obj => obj);
            assert.strictEqual(called, 3);
         });

         it('only calls subscriber once initially, including on resubscriptions', () =>
         {
            let num = 0;
            const store = version.writable('store', num, (set) => set(num += 1));

            let count1 = 0;
            let count2 = 0;

            store.subscribe(() => count1 += 1)();
            assert.strictEqual(count1, 1);

            const unsubscribe = store.subscribe(() => count2 += 1);
            assert.strictEqual(count2, 1);

            unsubscribe();
         });

         it('only calls subscriber once initially, including on resubscriptions', () =>
         {
            let num = 0;
            const store = version.writable('store', num, (set, update) => update((val) => val + 1));

            let count1 = 0;
            let count2 = 0;

            assert.equal('0', version.deserialize(globalThis.localStorage.getItem('store')));

            store.subscribe(() => count1 += 1)();
            assert.strictEqual(count1, 1);

            assert.equal('1', version.deserialize(globalThis.localStorage.getItem('store')));

            const unsubscribe = store.subscribe(() => count2 += 1);
            assert.strictEqual(count2, 1);

            assert.equal('2', version.deserialize(globalThis.localStorage.getItem('store')));

            unsubscribe();
         });

         it('initial value should be stored', () =>
         {
            const initial_value = 10;
            version.writable('store', initial_value);

            const stored_value = version.deserialize(globalThis.localStorage.getItem('store'));

            assert.strictEqual(initial_value, stored_value);
         })

         it('can store and retrieve objects', () =>
         {
            const initial_value = { count: 1 };
            let result_value = null;
            version.writable('store', initial_value);
            const store = version.writable('store', null);

            store.subscribe((value) => result_value = value);

            assert.deepStrictEqual(initial_value, result_value);
         })

         it('bad value in storage / should overwrite w/ initial value', () =>
         {
            const initial_value = 10;

            // @ts-expect-error   Artificially set bad data in storage.
            globalThis.localStorage.setItem('store', new Map([]));

            version.writable('store', initial_value);

            const stored_value = version.deserialize(globalThis.localStorage.getItem('store'));

            assert.strictEqual(initial_value, stored_value);
         })
      });

      describe('readable', () =>
      {
         it('creates a readable store', () =>
         {
            let running;
            let tick;

            const store = version.readable('store', void 0, (set) =>
            {
               tick = set;
               running = true;

               set(0);

               return () =>
               {
                  tick = () => void 0;
                  running = false;
               };
            });

            assert.ok(!running);

            const values = [];

            const unsubscribe = store.subscribe((value) => values.push(value));

            assert.ok(running);
            tick(1);
            tick(2);

            unsubscribe();

            assert.ok(!running);
            tick(3);
            tick(4);

            assert.deepStrictEqual(values, [0, 1, 2]);
         });
      });

      describe('derived', () =>
      {
         it('maps a single store', () =>
         {
            const a = version.writable('a', 1);
            const b = version.derived('b', a, n => n * 2);

            const values = [];

            const unsubscribe = b.subscribe((value) => values.push(value));

            a.set(2);
            assert.deepStrictEqual(values, [2, 4]);

            unsubscribe();

            a.set(3);
            assert.deepStrictEqual(values, [2, 4]);
         });

         it('maps multiple stores', () =>
         {
            const a = version.writable('a', 2);
            const b = version.writable('b', 3);
            const c = version.derived('c', ([a, b]), ([a, b]) => a * b);

            const values = [];

            const unsubscribe = c.subscribe((value) => values.push(value));

            a.set(4);
            b.set(5);
            assert.deepStrictEqual(values, [6, 12, 20]);

            unsubscribe();

            a.set(6);
            assert.deepStrictEqual(values, [6, 12, 20]);
         });

         it('passes optional set function', () =>
         {
            const number = version.writable('number', 1);
            const evens = version.derived('evens', number, (n, set) =>
            {
               if (n % 2 === 0) { set(n); }
            }, 0);

            const values = [];

            const unsubscribe = evens.subscribe((value) => values.push(value));

            number.set(2);
            number.set(3);
            number.set(4);
            number.set(5);
            assert.deepStrictEqual(values, [0, 2, 4]);

            unsubscribe();

            number.set(6);
            number.set(7);
            number.set(8);
            assert.deepStrictEqual(values, [0, 2, 4]);
         });

         it('prevents glitches', () =>
         {
            const lastname = version.writable('lastname', 'Jekyll');
            const firstname = version.derived('firstname', lastname, n => n === 'Jekyll' ? 'Henry' : 'Edward');

            const fullname = version.derived('fullname', [firstname, lastname], names => names.join(' '));

            const values = [];

            const unsubscribe = fullname.subscribe((value) => values.push(value));

            lastname.set('Hyde');

            assert.deepStrictEqual(values, [
               'Henry Jekyll',
               'Edward Hyde'
            ]);

            unsubscribe();
         });

         it('prevents diamond dependency problem', () =>
         {
            const count = version.writable('count', 0);
            const values = [];

            const a = version.derived('a', count, ($count) => 'a' + $count);
            const b = version.derived('b', count, ($count) => 'b' + $count);

            const combined = version.derived('combined', [a, b], ([a, b]) => a + b);

            const unsubscribe = combined.subscribe((value) => values.push(value));

            assert.deepStrictEqual(values, ['a0b0']);

            count.set(1);
            assert.deepStrictEqual(values, ['a0b0', 'a1b1']);

            unsubscribe();
         });

         it('derived dependency does not update and shared ancestor updates', () =>
         {
            const root = version.writable('root', {a: 0, b: 0});
            const values = [];

            const a = version.derived('a', root, ($root) => 'a' + $root.a);

            const b = version.derived('b', [a, root], ([$a, $root]) => 'b' + $root.b + $a);

            const unsubscribe = b.subscribe((value) => values.push(value));

            assert.deepStrictEqual(values, ['b0a0']);

            root.set({a: 0, b: 1});
            assert.deepStrictEqual(values, ['b0a0', 'b1a0']);

            unsubscribe();
         });

         it('is updated with safe_not_equal logic', () =>
         {
            const arr = [0];

            const number = version.writable('number', 1);
            const numbers = version.derived('numbers', number, ($number) =>
            {
               arr[0] = $number;
               return arr;
            });

            const concatenated = [];

            const unsubscribe = numbers.subscribe((value) => concatenated.push(...value));

            number.set(2);
            number.set(3);

            assert.deepStrictEqual(concatenated, [1, 2, 3]);

            unsubscribe();
         });

         it('calls a cleanup function', () =>
         {
            const num = version.writable('num', 1);

            const values = [];
            const cleaned_up = [];

            const d = version.derived('d', num, ($num, set) =>
            {
               set($num * 2);

               return function cleanup() { cleaned_up.push($num); };
            });

            num.set(2);

            const unsubscribe = d.subscribe((value) => values.push(value));

            num.set(3);
            num.set(4);

            assert.deepStrictEqual(values, [4, 6, 8]);
            assert.deepStrictEqual(cleaned_up, [2, 3]);

            unsubscribe();

            assert.deepStrictEqual(cleaned_up, [2, 3, 4]);
         });

         it('discards non-function return values', () =>
         {
            const num = version.writable('num', 1);

            const values = [];

            const d = version.derived('d', num, ($num, set) => set($num * 2));

            num.set(2);

            const unsubscribe = d.subscribe((value) => values.push(value));

            num.set(3);
            num.set(4);

            assert.deepStrictEqual(values, [4, 6, 8]);

            unsubscribe();
         });

         it('allows derived with different types', () =>
         {
            const a = version.writable('a', 'one');
            const b = version.writable('b', 1);
            const c = version.derived('c', [a, b], ([a, b]) => `${a} ${b}`);

            assert.deepStrictEqual(get(c), 'one 1');

            a.set('two');
            b.set(2);
            assert.deepStrictEqual(get(c), 'two 2');
         });

         it('initial value in already in storage (override w/ correct derived value)', () =>
         {
            globalThis.localStorage.setItem('b', '4')

            const a = version.writable('a', 1);
            const b = version.derived('b', a, n => n * 2);

            const values = [];

            const unsubscribe = b.subscribe((value) => values.push(value));

            a.set(2);
            assert.deepStrictEqual(values, [2, 4]);

            unsubscribe();

            a.set(3);
            assert.deepStrictEqual(values, [2, 4]);
         });
      });

      describe('get', () =>
      {
         it('gets the current value of a store', () =>
         {
            const store = version.readable('store', 42, () => void 0);
            assert.strictEqual(get(store), 42);
         });

         it('works with RxJS-style observables', () => {
            const observable = {
               subscribe(fn) {
                  fn(42);
                  return { unsubscribe: () => void 0 };
               }
            };

            // @ts-expect-error
            assert.strictEqual(get(observable), 42);
         });
      });
   });
}

