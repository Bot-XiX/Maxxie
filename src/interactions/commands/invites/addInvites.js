const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getEffectiveInvites, checkInviteRewards } = require("@src/handlers/invite-handler");
const { incrementInvites } = require("@schemas/InviteLog");
const { EMBED_COLORS } = require("@root/config.js");

module.exports = class AddInvites extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "addinvites",
      description: "add invites to a member",
      enabled: true,
      category: "INVITE",
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "user",
          description: "the user to give invites to",
          type: "USER",
          required: true,
        },
        {
          name: "invites",
          description: "the number of invites to give",
          type: "INTEGER",
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
    const amount = interaction.options.getInteger("invites");

    if (user.bot) return interaction.followUp("Oops! You cannot add invites to bots");

    const inviteData = await incrementInvites(interaction.guildId, user.id, "ADDED", amount);

    const embed = new MessageEmbed()
      .setAuthor(`Added invites to ${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`${user.tag} now has ${getEffectiveInvites(inviteData)} invites`);

    await interaction.followUp({ embeds: [embed] });
    checkInviteRewards(interaction.guild, inviteData, true);
  }
};
