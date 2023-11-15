const { SlashCommandBuilder } = require('discord.js');
const { displayText, generate, processInput } = require('../helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll any number of dice using a #d# format, with each set seperated by a comma')
		.addStringOption(option => 
			option
				.setName('input')
				.setDescription('dice to roll #d#[+/-#]; seperate rolls with ,')
				.setRequired(true)),
	async execute(interaction) {
		if(!interaction.isChatInputCommand()) return;
		let pattern, rolls, requiredInput, requiredData, response, results, replied;

		// regex to determine dice input formatting
		pattern = /^([1-9]\d*)d([1-9]\d*)(\!)?(\+[1-9]\d*|\-[1-9]\d*)?$/;
		replied = false;
		// keep track of the results of each roll
		results = [];
		// track what each set that needs rolled is
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

		// generate rolls from each input and place them in the results array
		rolls.forEach(roll => results.push(generate(roll)));

		// send the response only if the error above has not run
		if(!replied) await interaction.reply(displayText(requiredInput, results));
	}
};
