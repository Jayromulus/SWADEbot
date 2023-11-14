const { SlashCommandBuilder } = require('discord.js');
const { displayText, generate, processInput } = require('../helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll2')
		.setDescription('Roll 2: Electric Boogaloo')
		.addStringOption(option => 
			option
				.setName('input')
				.setDescription('dice to roll #d#[+/-#]; seperate rolls with ,')),
	async execute(interaction) {
		if(!interaction.isChatInputCommand()) return;
		let pattern, rolls, requiredInput, requiredData, response, results, replied;

		// regex to determine dice input formatting
		pattern = /^\+?([1-9]\d*)d\+?([1-9]\d*)(\!)?(\+|\-[1-9]\d*)?$/;
		replied = false;
		rolls = [];
		// remove spaces from the input and split by commas for each individual set to roll
		requiredInput = interaction.options.getString('input').replaceAll(' ', '').split(',');

		// spit out an error when regex doesn't match on one of the rolls !(rework to roll all but the missing case)
		for(const input of requiredInput) {
			if(!pattern.test(input)) {
				replied = true;
				await interaction.reply(`Invalid Input: ${input}`);
			}
			rolls.push(processInput(input));
		}

		results = rolls.map(roll => await generate(roll));

		console.log(results);

		if(!replied) await interaction.reply(`input success`);
	}
};
