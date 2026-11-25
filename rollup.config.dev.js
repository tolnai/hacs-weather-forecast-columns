import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/index.ts',
  output: {
    file: '../www/hacs-weather-forecast-columns.js',
    format: 'es',
    sourcemap: true,
    intro: 'const __WEATHER_COLUMNS_DEV__ = true;',
  },
  plugins: [
    image(),
    nodeResolve(),
    commonjs(),
    typescript({ sourceMap: true }),
    json(),
    serve({
      contentBase: '../www',
      host: '0.0.0.0',
      port: 5001,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ],
};
