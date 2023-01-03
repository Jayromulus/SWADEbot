const { SlashCommandBuilder } = require('discord.js');

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
  if(bonus) rolls.push(bonus);

  calculate = rolls.flat();
  total = calculate.reduce((a, b) => parseInt(a) + parseInt(b), 0);
  highRolls = rolls.map(r => r.reduce((a, b) => parseInt(a) + parseInt(b), 0));
  lowRolls = rolls.filter(r => r.length < 2 );
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