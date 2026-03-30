import { SYSTEM_ID } from '~/constants';
import { registerSettings } from '~/settings';

Hooks.once('init', () => {
  console.log(`${SYSTEM_ID} | Initializing system`);

  registerSettings();

  // Register document types in CONFIG.Actor.dataModels and CONFIG.Item.dataModels
  // Register custom sheets
  // Preload Handlebars templates
});

Hooks.once('ready', () => {
  console.log(`${SYSTEM_ID} | System ready`);
});
