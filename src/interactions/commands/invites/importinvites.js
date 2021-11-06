const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { incrementInvites } = require("@schemas/InviteLog");

module.exports = class ImportInvites extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "importinvites",
      description: "add existing guild invites to users",
      enabled: true,
      category: "INVITE",
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "user",
          description: "the user to import invites for",
          type: "USER",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const target = interaction.options.getUser("user");
    const invites = await interaction.guild.invites.fetch({ cache: false });

    if (target.bot) return interaction.followUp("Oops! You cannot import invites for bots");

    invites.forEach(async (invite) => {
      const user = invite.inviter;
      if (!user || invite.uses === 0) return; // No inviter
      if (target && user.id !== target.id) return; // Skipping non user
      await incrementInvites(interaction.guildId, user.id, "ADDED", invite.uses);
    });

    return interaction.followUp(`Done! Previous invites added to ${target ? target.tag : "all members"}`);
  }
};
