import Generator from 'yeoman-generator';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export default class WarhammerTranslationGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('answers', { type: String, description: 'JSON string of prompt answers to skip interactive prompts' });
  }

  async prompting() {
    if (this.options.answers) {
      this.answers = JSON.parse(this.options.answers);
      this.config.set('type', 'warhammer-translation');
      Object.entries(this.answers).forEach(([key, value]) => this.config.set(key, value));
      return;
    }

    const saved = this.config.getAll();

    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Module ID (e.g., impmal-system-translation-pl):',
        default: saved.id || this.appname,
        store: true,
      },
      {
        type: 'input',
        name: 'title',
        message: 'Module title:',
        default: saved.title,
        store: true,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: saved.description,
        store: true,
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name:',
        default: saved.author || 'Radoslaw Klos',
        store: true,
      },
      {
        type: 'input',
        name: 'email',
        message: 'Author email:',
        default: saved.email || 'radoslaw@klos.dev',
        store: true,
      },
      {
        type: 'list',
        name: 'license',
        message: 'License:',
        choices: ['MIT', 'GPL-3.0'],
        default: saved.license || 'GPL-3.0',
        store: true,
      },
      {
        type: 'input',
        name: 'outputFilename',
        message: 'Output filename (without extension):',
        default: saved.outputFilename,
        store: true,
      },
      {
        type: 'input',
        name: 'packagesStr',
        message: 'Package names (comma-separated, e.g., custom, impmal, warhammer-library):',
        default: saved.packagesStr || 'custom',
        store: true,
      },
      {
        type: 'input',
        name: 'requiredSystemId',
        message: 'Required system ID (e.g., impmal):',
        default: saved.requiredSystemId,
        store: true,
      },
      {
        type: 'input',
        name: 'requiredSystemMinVersion',
        message: 'Required system minimum version (e.g., 3.1.0):',
        default: saved.requiredSystemMinVersion || '1.0.0',
        store: true,
      },
      {
        type: 'input',
        name: 'patchConfigStr',
        message: 'Patch config (format: pkg1=dir1,dir2;pkg2=dir3):',
        default: saved.patchConfigStr || '',
        store: true,
      },
      {
        type: 'input',
        name: 'logPrefix',
        message: 'Log prefix (e.g., IMPMAL-PL):',
        default: saved.logPrefix,
        store: true,
      },
      {
        type: 'input',
        name: 'logColor',
        message: 'Log color (hex or rgb, e.g., #007a72):',
        default: saved.logColor || '#007a72',
        store: true,
      },
    ]);

    this.config.set('type', 'warhammer-translation');
  }

  configuring() {
    this.packages = this.answers.packagesStr.split(',').map((s) => s.trim()).filter(Boolean)
      .map((name) => ({ name, camelCase: toCamelCase(name) }));

    this.patchConfig = {};
    if (this.answers.patchConfigStr) {
      this.answers.patchConfigStr.split(';').forEach((entry) => {
        const [pkg, dirs] = entry.split('=');
        if (pkg && dirs) {
          this.patchConfig[pkg.trim()] = dirs.split(',').map((d) => d.trim());
        }
      });
    }

    const prefix = this.answers.logPrefix.toLowerCase().replace(/-/g, '');
    this.logFunctionName = `${prefix}Log`;
  }

  get default() {
    return {
      composeBase() {
        const extraScripts = {
          report: 'tsx tools/commands/report/command.ts',
          sync: 'tsx tools/commands/sync/command.ts',
          patch: 'tsx tools/commands/patch/command.ts',
          'auto-import-styles': 'tsx tools/auto-import-styles.ts',
        };

        const extraDeps = {
          diff: '8.0.2',
        };

        const extraDevDeps = {
          '@foundryvtt/foundryvtt-cli': '1.1.0',
          '@octokit/core': '7.0.3',
          'chalk': '5.4.1',
          'discord.js': '14.21.0',
          'simple-git': '3.28.0',
        };

        this.composeWith(
          path.resolve(__dirname, '../_base/index.js'),
          {
            id: this.answers.id,
            title: this.answers.title,
            description: this.answers.description,
            author: this.answers.author,
            email: this.answers.email,
            license: this.answers.license,
            outputFilename: this.answers.outputFilename,
            type: 'warhammer-translation',
            extraScripts: JSON.stringify(extraScripts),
            extraDeps: JSON.stringify(extraDeps),
            extraDevDeps: JSON.stringify(extraDevDeps),
          },
        );
      },
    };
  }

  writing() {
    const tplVars = {
      ...this.answers,
      packages: this.packages,
      patchConfig: this.patchConfig,
      logFunctionName: this.logFunctionName,
    };

    // --- Always overwrite: tools, .vite, docs, workflows ---
    this.fs.copyTpl(
      this.templatePath('tools.config.ts'),
      this.destinationPath('tools.config.ts'),
      tplVars,
    );

    const toolFiles = [
      '.vite/load-patches.ts',
      'tools/auto-import-styles.ts',
      'tools/bundle-jsons.ts',
      'tools/commands/patch/command.ts',
      'tools/commands/patch/actions/download.ts',
      'tools/commands/patch/actions/create.ts',
      'tools/commands/patch/actions/apply.ts',
      'tools/commands/patch/actions/find-duplicated-lines.ts',
      'tools/commands/report/command.ts',
      'tools/commands/report/types.d.ts',
      'tools/commands/report/get-latest-changes.ts',
      'tools/commands/report/checks/translations.ts',
      'tools/commands/report/checks/scripts.ts',
      'tools/commands/report/checks/templates.ts',
      'tools/commands/sync/command.ts',
      'tools/commands/sync/sources/wfrp4e.ts',
      'tools/commands/sync/sources/source.ts',
      'tools/utils/consts.ts',
      'tools/utils/discord.ts',
      'tools/utils/fetch-github-raw-content.ts',
      'tools/utils/ast.ts',
      'tools/utils/update-nested-values.ts',
    ];

    for (const file of toolFiles) {
      this.fs.copy(
        this.templatePath(file),
        this.destinationPath(file),
      );
    }

    const docFiles = [
      'docs/custom-package.md',
      'docs/package-development.md',
      'docs/patching-system.md',
      'docs/translation-guide.md',
      'docs/README.md',
    ];

    for (const file of docFiles) {
      this.fs.copy(
        this.templatePath(file),
        this.destinationPath(file),
      );
    }

    this.fs.copy(
      this.templatePath('.github/workflows/report.yml'),
      this.destinationPath('.github/workflows/report.yml'),
    );
    this.fs.copy(
      this.templatePath('.github/workflows/sync.yml'),
      this.destinationPath('.github/workflows/sync.yml'),
    );

    // --- First-run only: src/ ---
    if (!this.fs.exists(this.destinationPath('src/main.ts'))) {
      this.fs.copyTpl(
        this.templatePath('src/main.ts'),
        this.destinationPath('src/main.ts'),
        tplVars,
      );
      this.fs.copyTpl(
        this.templatePath('src/module.json'),
        this.destinationPath('src/module.json'),
        tplVars,
      );
      this.fs.copyTpl(
        this.templatePath('src/utils/log.ts'),
        this.destinationPath('src/utils/log.ts'),
        tplVars,
      );
      this.fs.copy(
        this.templatePath('src/utils/wait.ts'),
        this.destinationPath('src/utils/wait.ts'),
      );
      this.fs.copyTpl(
        this.templatePath('src/utils/apply-patches.ts'),
        this.destinationPath('src/utils/apply-patches.ts'),
        tplVars,
      );
      this.fs.copyTpl(
        this.templatePath('src/packages/index.ts'),
        this.destinationPath('src/packages/index.ts'),
        tplVars,
      );
      this.fs.copy(
        this.templatePath('src/packages/custom/index.ts'),
        this.destinationPath('src/packages/custom/index.ts'),
      );
      this.fs.copy(
        this.templatePath('src/packages/custom/lang.json'),
        this.destinationPath('src/packages/custom/lang.json'),
      );
      this.fs.copy(
        this.templatePath('src/packages/custom/styles/main.scss'),
        this.destinationPath('src/packages/custom/styles/main.scss'),
      );

      this.fs.write(this.destinationPath('src/main.scss'), '');
    }
  }
}
