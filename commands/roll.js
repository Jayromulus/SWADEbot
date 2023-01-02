const { SlashCommandBuilder } = require('discord.js');

const rollDice = (base, bonus = 0) => {
  let rand = Math.floor(Math.random() * base + 1) + bonus;
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
    // if the result is the same as the size of the die being rolled (meaning it is a max roll)
    while (result === sides) {
      // reset result's value to a new roll and add it to the array of the current roll
      result = rollDice(sides);
      currentDice.push(result);
    }
    rolls.push(currentDice);
    currentRoll++;
  }
  if(bonus) rolls.push(bonus);
  return rolls.reduce((a, b) => parseInt(a) + parseInt(b), 0);
};

const standard = async (number, sides, bonus) => {
  let rolls = [];
  for (let n = 0; n < number; n++) {
    let indiv = [];
    indiv.push(rollDice(sides));
    if(bonus) rolls.push(bonus);
    rolls.push(indiv);
  }
  return rolls.reduce((a, b) => parseInt(a) + parseInt(b), 0);
};

const generate = (number, sides, type, bonus) => {
  return new Promise(async (res, rej) => {
    try {
      if(type === 'explode') {
        let result = await explode(number, sides, bonus);
        res(result);
      } else {
        let result = await standard(number, sides, bonus);
        res(result);
      }
    } catch(e) {
      rej(e)
    }
  })
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls an exploding trait roll using provided options')
    .addStringOption(option =>
      option
        .setName('set_1')
        .setDescription('dice to roll #d#(+/-#)')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('set_2')
        .setDescription('dice to roll #d#(+/-#)')),
	async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    let pattern = /^\+?(0|[1-9]\d*)d\+?(0|[1-9]\d*)(\+|\-[1-9]\d*)?$/;

    let requiredInput = interaction.options._hoistedOptions[0].value.trim()
    let optionalInput1 = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value.trim() : null;

    if(!pattern.test(inputTrait)) {
      await interaction.reply('Invalid Input');
      return;
    };

    let diced = requiredInput.split('d');
    let sliced = diced[1].split(diced[1].includes('+') ? '+' : '-');

    let n = diced[0];
    let s = sliced[0];
    let b = diced[1].includes('+') ? sliced[1] : -sliced[1];

    //! REFACTOR WILD TO SPLIT SIMILAR TO REQUIRED TO TAKE IN MULTIPLE ROLLS
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


// ! redo this to take in minimum 1 string formatted #d# and then multiple (possibly unlimited) optional inputs with #d# param, though this is unfortunate since it means i would need to undo a lot of things and might not even work as intended and cause stupid

//? maybe make a new command called "traitRoll" that takes in a die size and optional modifier then rolls it with a d6 and tells you whether it crit fails and each die result