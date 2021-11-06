const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

module.exports = class FlagTranslation extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "flagtranslation",
      description: "configure flag translation in the server",
      enabled: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      ephemeral: true,
      options: [
        {
          name: "enabled",
          description: "enable or disable flag translation",
          type: "BOOLEAN",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const status = interaction.options.getBoolean("enabled");
    const settings = await getSettings(interaction.guild);

    settings.flag_translation.enabled = status;
    await settings.save();

    await interaction.followUp(`Configuration saved! Flag translation is now ${status ? "enabled" : "disabled"}`);
  }
};
