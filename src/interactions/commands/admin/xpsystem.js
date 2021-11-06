const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

module.exports = class XPSystem extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "xpsystem",
      description: "configure the ranking system in the server",
      enabled: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      ephemeral: true,
      options: [
        {
          name: "enabled",
          description: "enable or disable xp tracking",
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
    settings.ranking.enabled = status;
    await settings.save();

    await interaction.followUp(`Configuration saved! XP System is now ${status ? "enabled" : "disabled"}`);
  }
};
