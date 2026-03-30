import { MODULE_ID } from '~/constants';
import { registerSettings } from '~/settings';

Hooks.once('init', () => {
  registerSettings();
});

Hooks.once('ready', () => {
  console.log(`${MODULE_ID} | Module ready`);
});
