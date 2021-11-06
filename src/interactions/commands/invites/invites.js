const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getEffectiveInvites } = require("@src/handlers/invite-handler");
const { getDetails } = require("@schemas/InviteLog");
const { EMBED_COLORS } = require("@root/config.js");

module.exports = class InvitesCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "invites",
      description: "shows user invites in this server",
      enabled: true,
      category: "INVITE",
      options: [
        {
          name: "user",
          description: "the user to get the invites for",
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
    const user = interaction.options.getUser("user") || interaction.user;

    const inviteData = await getDetails(interaction.guildId, user.id);
    if (!inviteData) return interaction.followUp(`No invite data found for \`${user.tag}\``);

    const embed = new MessageEmbed()
      .setAuthor(`Invites for ${user.username}`)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(`${user.toString()} has ${getEffectiveInvites(inviteData)} invites`)
      .addField("Total Invites", `**${inviteData?.tracked_invites + inviteData?.added_invites || 0}**`, true)
      .addField("Fake Invites", `**${inviteData?.fake_invites || 0}**`, true)
      .addField("Left Invites", `**${inviteData?.left_invites || 0}**`, true);

    return interaction.followUp({ embeds: [embed] });
  }
};
