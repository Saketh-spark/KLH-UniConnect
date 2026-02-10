import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createFilter } from '@rollup/pluginutils';
import { transformAsync } from '@babel/core';

const jsxPreprocessFilter = createFilter(['**/*.js'], ['**/node_modules/**']);

function babelJsxPreprocessor() {
  return {
    name: 'babel-jsx-preprocessor',
    enforce: 'pre',
    async transform(code, id) {
      if (!jsxPreprocessFilter(id) || id.includes('\0')) {
        return null;
      }
      const result = await transformAsync(code, {
        filename: id,
        sourceMaps: true,
        presets: [
          [
            '@babel/preset-react',
            {
              runtime: 'automatic',
              importSource: 'react'
            }
          ]
        ],
        babelrc: false,
        configFile: false,
        parserOpts: {
          plugins: ['jsx']
        }
      });
      if (!result) {
        return null;
      }
      return {
        code: result.code,
        map: result.map ?? null
      };
    }
  };
}

export default defineConfig({
  plugins: [
    babelJsxPreprocessor(),
    react({
      jsxInclude: [/\.jsx?$/]
    })
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 4173
  }
});
