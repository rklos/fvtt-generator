import Generator from 'yeoman-generator';

export default class BaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('id', { type: String });
    this.option('title', { type: String });
    this.option('description', { type: String });
    this.option('author', { type: String });
    this.option('email', { type: String });
    this.option('license', { type: String });
    this.option('outputFilename', { type: String });
    this.option('type', { type: String });
    this.option('extraScripts', { type: String, default: '{}' });
    this.option('extraDeps', { type: String, default: '{}' });
    this.option('extraDevDeps', { type: String, default: '{}' });
  }

  get writing() {
    return {
      copyStaticFiles() {
        const tplVars = {
          id: this.options.id,
          title: this.options.title,
          description: this.options.description,
          author: this.options.author,
          email: this.options.email,
          license: this.options.license,
          outputFilename: this.options.outputFilename,
          type: this.options.type,
          manifestFile: this.options.type === 'system' ? 'static/system.json' : 'module.json',
          repoUrl: `https://github.com/rklos/${this.options.id}`,
        };

        // Static files (no templating needed)
        this.fs.copy(
          this.templatePath('.npmrc'),
          this.destinationPath('.npmrc'),
        );
        this.fs.copy(
          this.templatePath('vite-env.d.ts'),
          this.destinationPath('vite-env.d.ts'),
        );

        // .gitignore (named gitignore in templates to avoid npm stripping it)
        this.fs.copy(
          this.templatePath('gitignore'),
          this.destinationPath('.gitignore'),
        );

        // Templated files
        this.fs.copyTpl(
          this.templatePath('eslint.config.js'),
          this.destinationPath('eslint.config.js'),
          tplVars,
        );
        this.fs.copyTpl(
          this.templatePath('tsconfig.json'),
          this.destinationPath('tsconfig.json'),
          tplVars,
        );
        this.fs.copyTpl(
          this.templatePath('vite.config.js'),
          this.destinationPath('vite.config.js'),
          tplVars,
        );
        this.fs.copyTpl(
          this.templatePath('tools/bump-version.ts'),
          this.destinationPath('tools/bump-version.ts'),
          tplVars,
        );
        this.fs.copyTpl(
          this.templatePath('.github/workflows/release.yml'),
          this.destinationPath('.github/workflows/release.yml'),
          tplVars,
        );
      },

      mergePackageJson() {
        const type = this.options.type;
        const extraScripts = JSON.parse(this.options.extraScripts);
        const extraDeps = JSON.parse(this.options.extraDeps);
        const extraDevDeps = JSON.parse(this.options.extraDevDeps);

        const scaffoldCmd = `npx yo fvtt:${type}`;

        const baseScripts = {
          build: type === 'warhammer-translation'
            ? 'vite build'
            : type === 'system'
              ? 'tsc --noEmit && vite build && npm run build:packs'
              : 'tsc --noEmit && vite build',
          'bump-version': 'tsx tools/bump-version.ts',
          'scaffold': scaffoldCmd,
        };

        if (type === 'warhammer-translation') {
          baseScripts.prebuild = 'npm run auto-import-styles && tsc --noEmit';
          baseScripts.postbuild = 'tsx tools/bundle-jsons.ts';
        }

        const baseDevDeps = {
          '@rklos/eslint-configs': 'github:rklos/eslint-configs#3.1.5',
          'eslint': '10.0.3',
          'eslint-import-resolver-typescript': '4.4.4',
          'fs-extra': '11.3.4',
          'fvtt-types': 'github:League-of-Foundry-Developers/foundry-vtt-types#main',
          'generator-fvtt': 'github:rklos/fvtt-generator',
          'sass': '1.98.0',
          'tsx': '4.21.0',
          'typescript': '5.9.3',
          'typescript-eslint': '8.57.0',
          'vite': '8.0.0',
          'yo': '^5.0.0',
        };

        this.fs.extendJSON(this.destinationPath('package.json'), {
          name: this.options.id,
          version: '0.1.0',
          type: 'module',
          scripts: { ...baseScripts, ...extraScripts },
          repository: {
            type: 'git',
            url: `git+https://github.com/rklos/${this.options.id}.git`,
          },
          author: `${this.options.author} <${this.options.email}>`,
          license: this.options.license,
          bugs: {
            url: `https://github.com/rklos/${this.options.id}/issues`,
          },
          homepage: `https://github.com/rklos/${this.options.id}#readme`,
          ...(Object.keys(extraDeps).length > 0 ? { dependencies: extraDeps } : {}),
          devDependencies: { ...baseDevDeps, ...extraDevDeps },
        });
      },
    };
  }
}
