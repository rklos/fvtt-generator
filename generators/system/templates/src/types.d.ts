/** Augment the global SettingConfig to register this system's settings. */
declare global {
  interface SettingConfig {
    // '<%= id %>.settingName': string;
  }

  type ActorDataModel = foundry.abstract.TypeDataModel<
    foundry.data.fields.DataSchema,
    Actor.Implementation
  >;

  type ItemDataModel = foundry.abstract.TypeDataModel<
    foundry.data.fields.DataSchema,
    Item.Implementation
  >;
}
