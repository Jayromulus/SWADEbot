const { SlashCommandBuilder } = require('discord.js');
const { cleanup } = require('../helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scroll')
    .setDescription('Calculates the price of a provided scroll')
    .addStringOption(option =>
      option
        .setName('rank')
        .setDescription('Rank of the scroll\'s inscription')
        .setChoices(
          { name: 'Novice', value: 'Novice' },
          { name: 'Seasoned', value: 'Seasoned' },
          { name: 'Veteran', value: 'Veteran' },
          { name: 'Legendary', value: 'Legendary' },
          { name: 'Heroic', value: 'Heroic' },
        )
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('cost')
        .setDescription('Cost required for the inscribed action')
        .setMinValue(0)
        .setRequired(true)),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = ['Novice', 'Seasoned', 'Veteran', 'Legendary', 'Heroic'];
    const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    );
  },
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const lib = { 'N': 1, 'S': 2, 'V': 3, 'H': 4, 'L': 5, };
    let rank, cost;

    rank = lib[interaction.options.getString('rank').toUpperCase()[0]] ?? -1;
    cost = cleanup(interaction.options.getNumber('cost'));

		// probably clean up output similar to potion
		// why is this if statement here? [11/15/23 0156]
    if (cost < 0 || rank < 0) await interaction.reply(`Invalid value for parameter: ${rank < 0 ? 'rank' : ''}`);
    return await interaction.reply(`${rank * cost * 50}`);
  },
};
