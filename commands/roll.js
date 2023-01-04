const { SlashCommandBuilder } = require('discord.js');
const { generate } = require('../helpers');

const processInput = (input) => {
  let bonus, diced, number, sides, sliced, type;

  diced = input.split('d');
  sliced = diced[1].split(diced[1].includes('+') ? '+' : '-');

  number = diced[0];
  type = diced[1].includes('!') ? 'explode' : 'standard';
  sides = type === 'explode' ? sliced[0].split('!')[0] : sliced[0];
  bonus = diced[1].includes('+') ? sliced[1] : -sliced[1];

  return { number, type, sides, bonus };
};

const displayText = (input1, input2 = []) => {
  let display;
  display = `**${input1[0]}:**\n\t- total: ${input1[1].total}\n\t- high: ${input1[1].high}\n\t- low: ${input1[1].low}`;
  if (!input2.length) return display;
  display += `\n\n**${input2[0]}:**\n\t- total: ${input2[1].total}\n\t- high: ${input2[1].high}\n\t- low: ${input2[1].low}`;
  return display;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls an exploding trait roll using provided options')
    .addStringOption(option =>
      option
        .setName('set_1')
        .setDescription('dice to roll #d#')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('set_2')
        .setDescription('dice to roll #d#')),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    let pattern, requiredInput, optionalInput, required, optional, requiredData, optionalData, response;

    pattern = /^\+?([1-9]\d*)d\+?([1-9]\d*)(\!)?(\+|\-[1-9]\d*)?$/;

    requiredInput = interaction.options.getString('set_1').trim();
    optionalInput = interaction.options.getString('set_2') ? interaction.options.getString('set_2').trim() : undefined;

    if (!pattern.test(requiredInput) || (optionalInput && !pattern.test(optionalInput))) {
      if (!pattern.test(requiredInput) && (optionalInput && !pattern.test(optionalInput))) {
        await interaction.reply(`Invalid Input: ${requiredInput}, ${optionalInput}`);
      }
      else if (!pattern.test(requiredInput)) {
        await interaction.reply(`Invalid Input: ${requiredInput}`);
      } else {
        await interaction.reply(`Invalid Input: ${optionalInput}`);
      }
      return;
    };

    requiredData = processInput(requiredInput);

    if (optionalInput !== undefined)
      optionalData = processInput(optionalInput);

    await interaction.reply(`${optionalInput ? 'First Roll: ' : 'Rolling: '}${requiredInput}${optionalInput ? `\nSecond Roll: ${optionalInput}` : ''}`);
    required = await generate(requiredData.number, requiredData.sides, requiredData.type, requiredData.bonus).catch(err => interaction.editReply(err));
    if (optionalInput) {
      optional = await generate(optionalData.number, optionalData.sides, optionalData.type, optionalData.bonus);

      if (required.length === 1 && optional.length === 1)
        if (required.low === 1 && optional.low === 1)
          return interaction.editReply('Critical Failure');

      response = displayText([requiredInput, required], [optionalInput, optional]);
      return interaction.editReply(response);
    } else {
      response = displayText([requiredInput, required]);
      return interaction.editReply(response);
    }
  },
};