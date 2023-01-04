const { SlashCommandBuilder } = require('discord.js');
const { cleanup } = require('../helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('potion')
		.setDescription('Calculates the price of a provided wand')
    .addStringOption(option =>
      option
        .setName('rank')
        .setDescription('Rank of the wand\'s cant')
        .setChoices(
          { name: 'Novice', value: 'Novice' },
          { name: 'Seasoned', value: 'Seasoned' },
          { name: 'Veteran', value: 'Veteran' },
          { name: 'Legendary', value: 'Legendary' } ,
          { name: 'Heroic', value: 'Heroic' },
        )
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('cost')
        .setDescription('Cost required for the action')
        .setMinValue(0)
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('strength')
        .setDescription('What strength of potion is being made')
        .setChoices(
          { name: 'Major', value: 'Major' },
          { name: 'Minor', value: 'Minor' }
        )
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
    let rank, cost, strength;

    rank = lib[interaction.options.getString('rank').toUpperCase()[0]] ?? -1;
    cost = cleanup(interaction.options.getNumber('cost'));
    strength = interaction.options.getString('strength') === 'Major' ? 2 : 1;

		return await interaction.reply(`${rank * cost * 25 * strength}`);
	},
};