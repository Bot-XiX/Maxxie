const { BotClient } = require("@src/structures");
const { counterHandler, inviteHandler } = require("@src/handlers");
const { cacheReactionRoles } = require("@schemas/Message");
const { getSettings } = require("@schemas/Guild");

/**
 * Emitted when the client becomes ready to start working.
 * @param {BotClient} client
 */
module.exports = async (client) => {
  client.logger.success(`Logged in as ${client.user.tag}! (${client.user.id})`);

  // Initialize Music Manager
  client.logger.log("Initializing music manager");
  client.musicManager.init(client.user.id);

  // Update Bot Presence
  updatePresence(client);
  setInterval(() => updatePresence(client), 10 * 60 * 1000);

  // Register global Interactions
  await client.registerGlobalInteractions();

  // Load reaction roles to cache
  await cacheReactionRoles(client);

  let counterGuilds, inviteGuilds;
  counterGuilds = inviteGuilds = 0;

  for (const guild of client.guilds.cache.values()) {
    // register guild commands
    client.registerGuildInteractions(guild);

    const settings = await getSettings(guild);

    // initialize counters
    if (settings.counters.length > 0) {
      ++counterGuilds;
      await counterHandler.init(guild, settings);
    }

    // cache invites for tracking enabled guilds
    if (settings.invite.tracking) {
      ++inviteGuilds;
      inviteHandler.cacheGuildInvites(guild);
    }
  }

  setInterval(() => counterHandler.updateCounterChannels(client), 1 * 60 * 60);

  client.logger.log(`Guilds with invite tracking: ${inviteGuilds}`);
  client.logger.log(`Guilds with counter channels: ${counterGuilds}`);
  client.logger.log(`Ready to serve ${client.guilds.cache.size} guilds!`);
};

/**
 * @param {BotClient} client
 */
const updatePresence = (client) => {
  const guilds = client.guilds.cache;
  const members = guilds.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0);

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: `${members} members in ${guilds.size} servers`,
        type: "WATCHING",
      },
    ],
  });
};
