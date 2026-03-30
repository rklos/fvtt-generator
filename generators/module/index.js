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
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
};

export default class ModuleGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('answers', { type: String, description: 'JSON string of prompt answers to skip interactive prompts' });
  }

  async prompting() {
    if (this.options.answers) {
      this.answers = JSON.parse(this.options.answers);
      this.config.set('type', 'module');
      // Save all answers to config for future re-runs
      Object.entries(this.answers).forEach(([key, value]) => this.config.set(key, value));
      return;
    }

    const saved = this.config.getAll();

    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Module ID (e.g., fumble-switch):',
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
      {
        type: 'input',
        name: 'optionalDeps',
        message: 'Optional module dependencies (comma-separated IDs, or empty):',
        default: saved.optionalDeps || '',
        store: true,
      },
    ]);

    this.config.set('type', 'module');
  }

  configuring() {
    this.languages = this.answers.languageCodes.map((code) => ({
      lang: code,
      name: LANGUAGE_MAP[code] || code,
    }));

    this.optionalDependencies = this.answers.optionalDeps
      ? this.answers.optionalDeps.split(',').map((s) => s.trim()).filter(Boolean).map((id) => ({
          id,
          type: 'module',
        }))
      : [];
  }

  get default() {
    return {
      composeBase() {
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
            type: 'module',
          },
        );
      },
    };
  }

  writing() {
    const tplVars = {
      ...this.answers,
      languages: this.languages,
      optionalDependencies: this.optionalDependencies,
    };

    // Skip src/ if it already exists (re-run)
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
        this.templatePath('src/module.json'),
        this.destinationPath('src/module.json'),
        tplVars,
      );

      for (const lang of this.languages) {
        this.fs.copyTpl(
          this.templatePath('src/lang/en.json'),
          this.destinationPath(`src/lang/${lang.lang}.json`),
          tplVars,
        );
      }
    }
  }
}
