const { SlashCommandBuilder } = require('discord.js');
const { cleanup } = require('../helpers');


const rollDice = (base, bonus = 0) => {
  let rand = Math.floor(Math.random() * base + 1) + bonus;
  // console.log('rand', rand);
  return rand;
};

const explode = async (number, sides, bonus) => {
  let rolls = [];
  let currentRoll = 0;
  let calculate, high, highRolls, lowRolls, low, length, total;

  while (currentRoll < number) {
    let result;
    let currentDice = [];

    result = rollDice(sides);
    currentDice.push(result);

    while (result === parseInt(sides)) {
      result = rollDice(sides);
      currentDice.push(result);
    }

    rolls.push(currentDice);
    currentRoll++;
  }
  if (bonus) rolls.push([bonus]);

  calculate = rolls.flat();
  total = calculate.reduce((a, b) => parseInt(a) + parseInt(b), 0);
  highRolls = rolls.map(r => r.reduce((a, b) => parseInt(a) + parseInt(b), 0));
  lowRolls = rolls.filter(r => r.length < 2);
  low = Math.min(...lowRolls.flat());
  high = Math.max(...highRolls.flat());
  length = rolls.length;

  return { high, low, length, rolls, total };
};

const generate = (number, sides, bonus) => {
  return new Promise(async (res, rej) => {
    try {
      let result = await explode(number, sides, bonus);
      res(result);
    } catch (e) {
      rej(e)
    }
  })
};

const displayText = (traitDie, trait, wildDie, wild, bonus) => {
  return `**RESULT: ${trait.total > wild.total ? trait.total : wild.total}**\n\t- Trait (1d${traitDie}${bonus ? '+' + bonus : ''}): ${trait.total}\n\t- Wild (1d${wildDie}): ${wild.total}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trait')
    .setDescription('Rolls an exploding trait roll using provided options')
    .addNumberOption(option =>
      option
        .setName('trait')
        .setDescription('size of your trait (no spaces between modifier)')
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('bonus')
        .setDescription('size of modified wild die (optional)'))
    .addNumberOption(option =>
      option
        .setName('wild')
        .setDescription('size of modified wild die (optional)')),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    let trait, wild, bonus, traitRoll, wildRoll, response;

    trait = cleanup(interaction.options.getNumber('trait'));
    wild = interaction.options.getNumber('wild') ? cleanup(interaction.options.getNumber('wild')) : 6;
    bonus = interaction.options.getNumber('bonus') ? cleanup(interaction.options.getNumber('bonus')) : 0;

    await interaction.reply(`Trait: 1d${trait}${''}\nWild Die: 1d${wild}\nBonus:${bonus}`);
    traitRoll = await generate(1, trait, bonus);
    wildRoll = await generate(1, wild);

    if (traitRoll.length === 1 && wildRoll.length === 1)
      if (traitRoll.low === 1 && wildRoll.low === 1)
        return interaction.editReply('Critical Failure');

    response = displayText(trait, traitRoll, wild, wildRoll, bonus);
    return interaction.editReply(response);
  },
};