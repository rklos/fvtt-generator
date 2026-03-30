import Generator from 'yeoman-generator';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class AppGenerator extends Generator {
  async prompting() {
    const savedType = this.config.get('type');

    if (savedType) {
      this.log(`Detected existing project type: ${savedType}`);
      this.projectType = savedType;
      return;
    }

    const answers = await this.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of Foundry VTT project?',
        choices: [
          { name: 'Module', value: 'module' },
          { name: 'System', value: 'system' },
          { name: 'Warhammer Translation', value: 'warhammer-translation' },
        ],
      },
    ]);

    this.projectType = answers.type;
  }

  get default() {
    return {
      compose() {
        this.composeWith(
          path.resolve(__dirname, `../${this.projectType}/index.js`),
        );
      },
    };
  }
}
