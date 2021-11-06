const { CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { getSettings } = require("@schemas/Guild");
const { isHex } = require("@utils/miscUtils");
const { buildGreeting } = require("@src/handlers/greeting-handler");
const { sendMessage } = require("@utils/botUtils");
const { canSendEmbeds } = require("@utils/guildUtils");

module.exports = class Farewell extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "farewell",
      description: "setup farewell message",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      options: [
        {
          name: "status",
          description: "enable or disable farewell message",
          type: "SUB_COMMAND",
          options: [
            {
              name: "status",
              description: "enabled or disabled",
              required: true,
              type: "STRING",
              choices: [
                {
                  name: "ON",
                  value: "ON",
                },
                {
                  name: "OFF",
                  value: "OFF",
                },
              ],
            },
          ],
        },
        {
          name: "preview",
          description: "preview the configured farewell message",
          type: "SUB_COMMAND",
        },
        {
          name: "channel",
          description: "set farewell channel",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel name",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
          ],
        },
        {
          name: "desc",
          description: "set embed description",
          type: "SUB_COMMAND",
          options: [
            {
              name: "content",
              description: "description content",
              type: "STRING",
              required: true,
            },
          ],
        },
        {
          name: "thumbnail",
          description: "configure embed thumbnail",
          type: "SUB_COMMAND",
          options: [
            {
              name: "status",
              description: "thumbnail status",
              type: "STRING",
              required: true,
              choices: [
                {
                  name: "ON",
                  value: "ON",
                },
                {
                  name: "OFF",
                  value: "OFF",
                },
              ],
            },
          ],
        },
        {
          name: "color",
          description: "set embed color",
          type: "SUB_COMMAND",
          options: [
            {
              name: "hex-code",
              description: "hex color code",
              type: "STRING",
              required: true,
            },
          ],
        },
        {
          name: "footer",
          description: "set embed footer",
          type: "SUB_COMMAND",
          options: [
            {
              name: "content",
              description: "footer content",
              type: "STRING",
              required: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");

    const settings = await getSettings(interaction.guild);

    if (sub === "status") {
      const status = interaction.options.getString("status") === "ON" ? true : false;
      settings.farewell.enabled = status;
      await settings.save();
      return interaction.followUp(`Configuration saved! Farewell message ${status ? "enabled" : "disabled"}`);
    }

    if (sub === "channel") {
      const target = interaction.options.getChannel("channel");
      if (!canSendEmbeds(target)) {
        return interaction.followUp(
          "Ugh! I cannot send greeting to that channel? I need the `Write Messages` and `Embed Links` permissions in " +
            target.toString()
        );
      }
      settings.farewell.channel_id = target.id;
      await settings.save();
      return interaction.followUp(`Configuration saved! Farewell message is set to ${target}`);
    }

    if (sub === "desc") {
      const content = interaction.options.getString("content");
      settings.farewell.embed.description = content;
      await settings.save();
      return interaction.followUp("Configuration saved! Farewell message updated");
    }

    if (sub === "thumbnail") {
      const status = interaction.options.getString("status") === "ON" ? true : false;
      settings.farewell.embed.thumbnail = status;
      await settings.save();
      return interaction.followUp("Configuration saved! Farewell message updated");
    }

    if (sub === "color") {
      const color = interaction.options.getString("color");
      if (!isHex(color)) return interaction.followUp("Oops! That doesn't look like a valid HEX Color code");
      settings.farewell.embed.color = color;
      await settings.save();
      return interaction.followUp("Configuration saved! Farewell message updated");
    }

    if (sub === "footer") {
      const content = interaction.options.getString("content");
      settings.farewell.embed.footer = content;
      await settings.save();
      return interaction.followUp("Configuration saved! Farewell message updated");
    }

    if (sub === "preview") {
      if (!settings.farewell?.enabled) return interaction.followUp("Farewell message not enabled in this server");
      const targetChannel = interaction.guild.channels.cache.get(settings.farewell.channel_id);
      if (!targetChannel) return interaction.followUp("No channel is configured to send farewell message");

      await interaction.followUp(`Sending farewell preview to ${targetChannel.toString()}`);

      const response = await buildGreeting(interaction.member, "FAREWELL", settings.farewell);
      return sendMessage(targetChannel, response);
    }

    // return
    else return interaction.followUp("Not a valid sub-command");
  }
};
