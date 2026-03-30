import Generator from 'yeoman-generator';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LANGUAGE_MAP = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

export default class SystemGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('answers', { type: String, description: 'JSON string of prompt answers to skip interactive prompts' });
  }

  async prompting() {
    if (this.options.answers) {
      this.answers = JSON.parse(this.options.answers);
      this.config.set('type', 'system');
      Object.entries(this.answers).forEach(([key, value]) => this.config.set(key, value));
      return;
    }

    const saved = this.config.getAll();

    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'System ID (e.g., neuro-and-shima):',
        default: saved.id || this.appname,
        store: true,
      },
      {
        type: 'input',
        name: 'title',
        message: 'System title:',
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
        default: saved.license || 'MIT',
        store: true,
      },
      {
        type: 'input',
        name: 'outputFilename',
        message: 'Output filename (without extension):',
        default: (answers) => saved.outputFilename || answers.id,
        store: true,
      },
      {
        type: 'input',
        name: 'actorTypesStr',
        message: 'Actor types (comma-separated, e.g., character, npc, enemy):',
        default: saved.actorTypesStr || 'character, npc',
        store: true,
      },
      {
        type: 'input',
        name: 'itemTypesStr',
        message: 'Item types (comma-separated, e.g., weapon, armor, equipment):',
        default: saved.itemTypesStr || 'weapon, armor, equipment',
        store: true,
      },
      {
        type: 'confirm',
        name: 'includeVitest',
        message: 'Include vitest setup?',
        default: saved.includeVitest !== undefined ? saved.includeVitest : true,
        store: true,
      },
      {
        type: 'input',
        name: 'packsStr',
        message: 'Packs (comma-separated name:label:type, e.g., weapons:Weapons:Item, or empty):',
        default: saved.packsStr || '',
        store: true,
      },
      {
        type: 'checkbox',
        name: 'languageCodes',
        message: 'Languages to include:',
        choices: Object.entries(LANGUAGE_MAP).map(([code, name]) => ({
          name: `${name} (${code})`,
          value: code,
        })),
        default: saved.languageCodes || ['en', 'pl'],
        store: true,
      },
    ]);

    this.config.set('type', 'system');
  }

  configuring() {
    this.actorTypes = this.answers.actorTypesStr.split(',').map((s) => s.trim()).filter(Boolean);
    this.itemTypes = this.answers.itemTypesStr.split(',').map((s) => s.trim()).filter(Boolean);
    this.languages = this.answers.languageCodes.map((code) => ({
      lang: code,
      name: LANGUAGE_MAP[code] || code,
    }));
    this.packs = this.answers.packsStr
      ? this.answers.packsStr.split(',').map((s) => s.trim()).filter(Boolean).map((entry) => {
          const [name, label, type] = entry.split(':').map((p) => p.trim());
          return { name, label: label || name, type: type || 'Item' };
        })
      : [];
  }

  get default() {
    return {
      composeBase() {
        const extraScripts = {
          'build:packs': 'tsx tools/build-packs.ts',
          test: 'vitest run',
          'test:watch': 'vitest',
          release: 'tsx tools/release.ts',
        };

        const extraDevDeps = {
          '@foundryvtt/foundryvtt-cli': '3.0.3',
          '@types/fs-extra': '11.0.4',
        };

        if (this.answers.includeVitest) {
          extraDevDeps.vitest = '4.1.0';
        }

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
            type: 'system',
            extraScripts: JSON.stringify(extraScripts),
            extraDevDeps: JSON.stringify(extraDevDeps),
          },
        );
      },
    };
  }

  writing() {
    const tplVars = {
      ...this.answers,
      actorTypes: this.actorTypes,
      itemTypes: this.itemTypes,
      languages: this.languages,
      packs: this.packs,
    };

    // Always overwrite: tools + vitest config
    this.fs.copy(
      this.templatePath('tools/build-packs.ts'),
      this.destinationPath('tools/build-packs.ts'),
    );
    this.fs.copy(
      this.templatePath('tools/release.ts'),
      this.destinationPath('tools/release.ts'),
    );

    if (this.answers.includeVitest) {
      this.fs.copy(
        this.templatePath('vitest.config.ts'),
        this.destinationPath('vitest.config.ts'),
      );
    }

    // Skip src/ if it already exists
    if (!this.fs.exists(this.destinationPath('src/main.ts'))) {
      this.fs.copyTpl(
        this.templatePath('src/main.ts'),
        this.destinationPath('src/main.ts'),
        tplVars,
      );
      this.fs.copyTpl(
        this.templatePath('src/constants.ts'),
        this.destinationPath('src/constants.ts'),
        tplVars,
      );
      this.fs.copyTpl(
        this.templatePath('src/settings.ts'),
        this.destinationPath('src/settings.ts'),
        tplVars,
      );
      this.fs.copyTpl(
        this.templatePath('src/types.d.ts'),
        this.destinationPath('src/types.d.ts'),
        tplVars,
      );
      this.fs.copyTpl(
        this.templatePath('src/static/system.json'),
        this.destinationPath('src/static/system.json'),
        tplVars,
      );
      this.fs.copy(
        this.templatePath('src/__tests__/setup.ts'),
        this.destinationPath('src/__tests__/setup.ts'),
      );
      this.fs.copy(
        this.templatePath('src/scss/main.scss'),
        this.destinationPath('src/scss/main.scss'),
      );
      this.fs.copy(
        this.templatePath('src/scss/_variables.scss'),
        this.destinationPath('src/scss/_variables.scss'),
      );
      this.fs.copy(
        this.templatePath('src/scss/_base.scss'),
        this.destinationPath('src/scss/_base.scss'),
      );

      for (const lang of this.languages) {
        this.fs.copyTpl(
          this.templatePath('src/static/lang/en.json'),
          this.destinationPath(`src/static/lang/${lang.lang}.json`),
          tplVars,
        );
      }
    }
  }
}
