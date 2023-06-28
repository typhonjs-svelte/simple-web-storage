import typescript    from '@rollup/plugin-typescript';
import dts           from 'rollup-plugin-dts';

// Produce sourcemaps or not.
const sourcemap = true;

const external = ['./generator.js', 'svelte/internal', 'svelte/store'];

/**
 * @returns {import('rollup').RollupOptions[]}
 */
export default () =>
{
   return [
      // Main Distribution -------------------------------------------------------------------------------------------
      {
         input: 'src/generator.ts',
         external,
         output: [{
            file: './dist/generator.js',
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap,
         }],
         plugins: [
            typescript({ include: ['src/local.ts', 'src/generator.ts'] })
         ]
      },
      {
         input: 'src/local.ts',
         external,
         output: [{
            file: './dist/local.js',
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap,
         }],
         plugins: [
            typescript({ include: ['src/local.ts', 'src/generator.ts'] })
         ]
      },
      {
         input: 'src/session.ts',
         external,
         output: [{
            file: './dist/session.js',
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap,
         }],
         plugins: [
            typescript({ include: ['src/session.ts', 'src/generator.ts'] })
         ]
      },

      // Main Distribution Bundled TS Declarations -------------------------------------------------------------------
      {
         input: 'src/local.ts',
         output: [{
            file: `./types/index.d.ts`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: false
         }],
         plugins: [
            dts()
         ]
      }
   ];
};
