const { SlashCommandBuilder } = require('discord.js');
const { format } = require('../helpers'); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Embed a Tweet (X) from a given link')
		.addStringOption(option =>
			option
				.setName('link')
				.setDescription('link to embed')
				.setRequired(true)
		),
	async execute(interaction) {
		await interaction.reply(format(interaction.options.getString('link')));
	}
};
