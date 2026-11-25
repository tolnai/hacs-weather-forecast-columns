import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import gzipPlugin from 'rollup-plugin-gzip';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/hacs-weather-forecast-columns.js',
    format: 'es',
    // Never a DEV build, see src/const.ts
    intro: 'const __WEATHER_COLUMNS_DEV__ = false;',
  },
  plugins: [image(), nodeResolve(), commonjs(), typescript(), json(), terser(), gzipPlugin()],
};
