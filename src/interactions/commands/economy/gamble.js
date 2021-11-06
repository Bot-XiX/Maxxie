const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getUser, addCoins } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { getRandomInt } = require("@utils/miscUtils");

module.exports = class Gamble extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "gamble",
      description: "try your luck by gambling",
      enabled: true,
      category: "ECONOMY",
      options: [
        {
          name: "coins",
          description: "number of coins to bet",
          required: true,
          type: "INTEGER",
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const user = interaction.user;
    const betAmount = interaction.options.getInteger("coins");

    if (isNaN(betAmount)) return interaction.followUp("Bet amount needs to be a valid number input");
    if (betAmount < 0) return interaction.followUp("Bet amount cannot be negative");
    if (betAmount < 10) return interaction.followUp("Bet amount cannot be less than 10");

    const economy = await getUser(user.id);
    if (!economy || economy?.coins < betAmount)
      return interaction.followUp(
        `You do not have sufficient coins to gamble!\n**Coin balance:** ${economy?.coins || 0}${ECONOMY.CURRENCY}`
      );

    const slot1 = getEmoji();
    const slot2 = getEmoji();
    const slot3 = getEmoji();

    const str = `
    **Gamble Amount:** ${betAmount}${ECONOMY.CURRENCY}
    **Multiplier:** 2x
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ‎‎‎‎║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ║
    ╚══════════╝
    `;

    const reward = calculateReward(betAmount, slot1, slot2, slot3);
    const result = (reward > 0 ? `You won: ${reward}` : `You lost: ${betAmount}`) + ECONOMY.CURRENCY;
    const balance = reward - betAmount;

    const remaining = await addCoins(user.id, balance);
    const embed = new MessageEmbed()
      .setAuthor(user.username, user.displayAvatarURL())
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setThumbnail("https://i.pinimg.com/originals/9a/f1/4e/9af14e0ae92487516894faa9ea2c35dd.gif")
      .setDescription(str)
      .setFooter(`${result}\nUpdated balance: ${remaining?.coins}${ECONOMY.CURRENCY}`);

    return interaction.followUp({ embeds: [embed] });
  }
};

function getEmoji() {
  const ran = getRandomInt(9);
  switch (ran) {
    case 1:
      return "\uD83C\uDF52";
    case 2:
      return "\uD83C\uDF4C";
    case 3:
      return "\uD83C\uDF51";
    case 4:
      return "\uD83C\uDF45";
    case 5:
      return "\uD83C\uDF49";
    case 6:
      return "\uD83C\uDF47";
    case 7:
      return "\uD83C\uDF53";
    case 8:
      return "\uD83C\uDF50";
    case 9:
      return "\uD83C\uDF4D";
    default:
      return "\uD83C\uDF52";
  }
}

function calculateReward(amount, var1, var2, var3) {
  if (var1 === var2 && var2.equals === var3) return 3 * amount;
  if (var1 === var2 || var2 === var3 || var1 === var3) return 2 * amount;
  return 0;
}
