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
<% if (type === 'system') { -%>
    emptyOutDir: false,
    cssFileName: '<%= outputFilename %>',
<% } else { -%>
    emptyOutDir: true,
<% } -%>
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
<% } else if (type === 'system') { -%>
    {
      name: 'clean-and-copy',
      async buildStart() {
        await fs.remove('dist');
        await fs.ensureDir('dist');
      },
      async closeBundle() {
        const staticDir = path.resolve(__dirname, 'src/static');
        const distDir = path.resolve(__dirname, 'dist/static');
        const entries = await fs.readdir(staticDir);
        for (const entry of entries) {
          await fs.copy(path.join(staticDir, entry), path.join(distDir, entry));
        }
        await fs.remove('dist/static/system.json');
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
