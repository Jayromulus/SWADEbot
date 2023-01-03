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
  if(bonus) rolls.push([bonus]);

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
        .setName('bonus')
        .setDescription('size of modified wild die (optional)'))
    .addNumberOption(option =>
      option
        .setName('wild')
        .setDescription('size of modified wild die (optional)')),
	async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    console.log(interaction.options._hoistedOptions)
    let trait = interaction.options._hoistedOptions[0].value.trim()
    let wild = interaction.options._hoistedOptions.filter(obj => obj.name === 'wild')[0] ? parseInt(interaction.options._hoistedOptions.filter(obj => obj.name === 'wild')[0].value.toString().trim()) : 6;
    let bonus = interaction.options._hoistedOptions.filter(obj => obj.name === 'bonus')[0] ? parseInt(interaction.options._hoistedOptions.filter(obj => obj.name === 'bonus')[0].value.toString().trim()) : 0;

    console.log('test',interaction.options._hoistedOptions.filter(obj => obj.name === 'bonus'))

		await interaction.reply(`Trait: 1d${trait}${''}\nWild Die: 1d${wild}\nBonus:${bonus}`);
    let traitRoll = await generate(1, trait, bonus);
    await generate(1, wild).then(wildRoll => {
      if(traitRoll.length === 1 && wild.length === 1)
        if(traitRoll.low === 1 && wild.low === 1) {
          interaction.editReply('Critical Failure');
          return;
        }
      interaction.editReply(`**RESULT: ${traitRoll.total > wildRoll.total ? traitRoll.total : wildRoll.total }**\n\t- Trait (1d${trait}${bonus ? '+' + bonus : ''}): ${traitRoll.total}\n\t- Wild (1d${wild}): ${wildRoll.total}`)
    }).catch(err => interaction.editReply(err));
	},
};