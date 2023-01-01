const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wand')
		.setDescription('Calculates the price of a provided wand')
    .addStringOption(option =>
      option
        .setName('rank')
        .setDescription('Rank of the wand\'s cant')
        // .setAutocomplete(true)
        // * choices over autocomplete to force them to use a given value while allowing them to type a value initially to autofill
        // https://discordjs.guide/slash-commands/advanced-creation.html#choices
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
    .addNumberOption(option =>
      option
        .setName('charges')
        .setDescription('Charges infused in the wand')
        .setMinValue(0)
        .setRequired(true)),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    // https://discordjs.guide/slash-commands/autocomplete.html#sending-results
		const choices = ['Novice', 'Seasoned', 'Veteran', 'Legendary', 'Heroic'];
		const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
  },
	async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const lib = { 'N': 1, 'S': 2, 'V': 3, 'H': 4, 'L': 5, };

    // console.log(interaction.options._hoistedOptions[0].value);

    const rank = lib[interaction.options._hoistedOptions[0].value[0].toUpperCase()] ?? -1;
    const cost = interaction.options._hoistedOptions[1].value;
    const charges = interaction.options._hoistedOptions[2].value;

		await interaction.reply(`${rank * cost * charges * 50}`);
	},
};