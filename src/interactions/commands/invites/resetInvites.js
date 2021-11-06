const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { clearInvites } = require("@schemas/InviteLog");

module.exports = class ResetInvites extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "resetinvites",
      description: "clear previously added invites",
      enabled: true,
      category: "INVITE",
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "user",
          description: "the user to clear invites for",
          type: "USER",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const user = interaction.options.getUser("user");
    if (user.bot) return interaction.followUp("Oops! You cannot reset invites for bots");
    await clearInvites(interaction.guildId, user.id);
    return interaction.followUp(`Done! Invites cleared for \`${user.tag}\``);
  }
};
