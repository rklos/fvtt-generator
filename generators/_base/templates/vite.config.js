import { defineConfig } from 'vite';
import fs from 'fs-extra';
import path from 'path';
<% if (type === 'warhammer-translation') { -%>
import { injectPatches } from './.vite/load-patches';
import toolsConfig from './tools.config';
<% } -%>

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
<% if (type === 'warhammer-translation') { -%>
      fileName: toolsConfig.vite.output,
<% } else { -%>
      fileName: '<%= outputFilename %>',
<% } -%>
      formats: [ 'es' ],
    },
    minify: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
<% if (type === 'module') { -%>
    {
      name: 'copy-static-files',
      closeBundle: async () => {
        await fs.copy('src/module.json', 'dist/module.json');
        await fs.copy('src/lang', 'dist/lang');
      },
    },
<% } else if (type === 'warhammer-translation') { -%>
    {
      name: 'copy-module-json',
      closeBundle: async () => {
        await fs.copy('src/module.json', 'dist/module.json');
      },
    },
    injectPatches(),
<% } -%>
  ],
});
