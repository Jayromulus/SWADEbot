const { SlashCommandBuilder } = require('discord.js');

const rollDice = (base, bonus = 0) => {
  let rand = Math.floor(Math.random() * base + 1) + bonus;
  // console.log('rand', rand);
  return rand;
};

const explode = async (number, sides, bonus) => {
  let rolls = [];
  // track the current roll index
  let currentRoll = 0;
  // for as long as the current die index being rolled is lower than the number of dice being rolled
  while (currentRoll < number) {
    // box to hold the values of the current dice and result from each roll
    let result;
    let currentDice = [];
    // roll the die of size provided by the args
    result = rollDice(sides);
    // console.log('result:', result)
    // add the result into the roll list
    currentDice.push(result);
    // console.log('result:', result == sides);
    // if the result is the same as the size of the die being rolled (meaning it is a max roll)
    while (result == sides) {
      // reset result's value to a new roll and add it to the array of the current roll
      result = rollDice(sides);
      currentDice.push(result);
    }
    rolls.push(...currentDice);
    currentRoll++;
  }
  if(bonus) rolls.push(bonus);
  let total = rolls.reduce((a, b) => parseInt(a) + parseInt(b), 0);
  let low = Math.min(rolls);
  let length = rolls.length
  return { total, low, length };
};

const generate = (number, sides, bonus) => {
  return new Promise(async (res, rej) => {
    try {
      let result = await explode(number, sides, bonus);
      res(result);
    } catch(e) {
      rej(e)
    }
  })
};

// ! REFACTOR TO HAVE 2 OPTIONAL INPUTS, REQUIRE ONLY SIZE OF DIE WITH NO NUMBER OF DICE (ASSUMED ONE), FIRST TAKES IN BONUS, SECOND IS WILD SIZE
// ! TEST IF THE PARAMS ARE ORDERED AND IF THEY ARENT THEY YOU CAN JUST DO WHATEVER BECAUSE THAT WOULD BE BASED
module.exports = {
	data: new SlashCommandBuilder()
		.setName('trait')
		.setDescription('Rolls an exploding trait roll using provided options')
    .addStringOption(option =>
      option
        .setName('trait')
        .setDescription('size of your trait (no spaces between modifier)')
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('wild')
        .setDescription('size of modified wild die (optional)')),
	async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    let pattern = /^\+?(0|[1-9]\d*)d\+?(0|[1-9]\d*)(\+|\-[1-9]\d*)?$/;

    let inputTrait = interaction.options._hoistedOptions[0].value.trim()
    let inputWild = interaction.options._hoistedOptions[1] ? parseInt(interaction.options._hoistedOptions[1].value.toString().trim()) : 6;

    if(!pattern.test(inputTrait)) {
      await interaction.reply('Invalid Trait Die');
      return;
    };

    let diced = inputTrait.split('d');
    let sliced = diced[1].split(diced[1].includes('+') ? '+' : '-');

    let n = diced[0];
    let s = sliced[0];
    let b = diced[1].includes('+') ? sliced[1] : -sliced[1];

		await interaction.reply(`Trait: ${inputTrait}\nWild Die: 1d${inputWild}`);
    let trait = await generate(n, s, b)
    await generate(1, inputWild).then(wild => {
      if(trait.length === 1 && wild.length === 1)
        if(trait.low === 1 && wild.low === 1) {
          interaction.editReply('Critical Failure');
          return;
        }
      // console.log('trait:',trait);
      // console.log('wild:',wild);
      interaction.editReply(`**RESULT: ${trait.total > wild.total ? trait.total : wild.total }**\n\nTrait: ${trait.total}\nWild: ${wild.total}`)
    }).catch(err => interaction.editReply(err));
	},
};