import typescript    from '@rollup/plugin-typescript';
import dts           from 'rollup-plugin-dts';

// Produce sourcemaps or not.
const sourcemap = true;

// Marks all local package.json `imports` and `svelte` as external.
const external = [/#simple-web-storage\/*/, /svelte\/*/];

// Converts local package.json imports to final package sub-path exports.
const paths = {
   '#simple-web-storage/generator': '@typhonjs-svelte/simple-web-storage/generator',
   '#simple-web-storage/local': '@typhonjs-svelte/simple-web-storage/local',
   '#simple-web-storage/session': '@typhonjs-svelte/simple-web-storage/session'
};

/**
 * @returns {import('rollup').RollupOptions[]}
 */
export default () =>
{
   return [
      // Main Distribution -------------------------------------------------------------------------------------------

      {
         input: 'src/index.ts',
         external,
         output: [{
            file: './dist/index.js',
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap
         }],
         plugins: [
            typescript({ include: ['src/index.ts'] })
         ]
      },
      {
         input: 'src/generator/index.ts',
         external,
         output: [{
            file: './dist/generator/index.js',
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap,
         }],
         plugins: [
            typescript({ include: ['src/generator/index.ts'] })
         ]
      },
      {
         input: 'src/local/index.ts',
         external,
         output: [{
            file: './dist/local/index.js',
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap,
         }],
         plugins: [
            typescript({ include: ['src/local/index.ts'] })
         ]
      },
      {
         input: 'src/session/index.ts',
         external,
         output: [{
            file: './dist/session/index.js',
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap,
         }],
         plugins: [
            typescript({ include: ['src/session/index.ts'] })
         ]
      },

      // Main Distribution Bundled TS Declarations -------------------------------------------------------------------

      {
         input: 'src/index.ts',
         external,
         output: [{
            file: `./dist/index.d.ts`,
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap: false
         }],
         plugins: [
            dts()
         ]
      },
      {
         input: 'src/generator/index.ts',
         external,
         output: [{
            file: `./dist/generator/index.d.ts`,
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap: false
         }],
         plugins: [
            dts()
         ]
      },
      {
         input: 'src/local/index.ts',
         external,
         output: [{
            file: `./dist/local/index.d.ts`,
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap: false
         }],
         plugins: [
            dts({ compilerOptions: { removeComments: false }})
         ]
      },
      {
         input: 'src/session/index.ts',
         external,
         output: [{
            file: `./dist/session/index.d.ts`,
            format: 'es',
            generatedCode: { constBindings: true },
            paths,
            sourcemap: false
         }],
         plugins: [
            dts({ compilerOptions: { removeComments: false }})
         ]
      }
   ];
};
