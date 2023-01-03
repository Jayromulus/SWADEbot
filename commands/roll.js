const { SlashCommandBuilder } = require('discord.js');

const rollDice = (base, bonus = 0) => {
  let rand = Math.floor(Math.random() * base + 1) + bonus;
  return rand;
};

const explode = async (number, sides, bonus) => {
  let rolls = [];
  let currentRoll = 0;
  let calculate, lowRolls, low, length, total;

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
  lowRolls = rolls.filter(r => r.length < 2 );
  low = Math.min(...lowRolls.flat());
  length = rolls.length;

  return { total, low, length };
};

const standard = async (number, sides, bonus) => {
  let rolls = [];
  let low, length, total;

  for (let n = 0; n < number; n++) {
    let indiv = rollDice(sides);
    rolls.push(indiv);
    if (bonus) rolls.push(bonus);
  }

  if(bonus) rolls.push(bonus);

  total = rolls.reduce((a, b) => parseInt(a) + parseInt(b), 0);
  low = Math.min(...rolls);
  length = rolls.length;

  return { total, low, length };
};

const generate = (number, sides, type, bonus) => {
  return new Promise(async (res, rej) => {
    try {
      if (type === 'explode') {
        let result = await explode(number, sides, bonus);
        res(result);
      } else {
        let result = await standard(number, sides, bonus);
        console.log(result)
        res(result);
      }
    } catch (e) {
      rej(e)
    }
  })
};

const displayText = (input1, input2 = {}) => {
  console.log(input2 ? 'YIKES' : 'radical')
}

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

    let pattern = /^\+?(0|[1-9]\d*)d\+?(0|[1-9]\d*)(\!)?(\+|\-[1-9]\d*)?$/;

    let requiredInput = interaction.options._hoistedOptions[0].value.trim();
    let optionalInput1 = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value.trim() : undefined;

    if (!pattern.test(requiredInput)) {
      await interaction.reply('Invalid Input');
      return;
    };

    let diced1 = requiredInput.split('d');
    let sliced1 = diced1[1].split(diced1[1].includes('+') ? '+' : '-');

    let n1 = diced1[0];
    let t1 = diced1[1].includes('!') ? 'explode' : 'standard';
    let s1 = t1 === 'explode' ? sliced1[0].split('!')[0] : sliced1[0];
    let b1 = diced1[1].includes('+') ? sliced1[1] : -sliced1[1];

    let diced2;
    let sliced2;
    let n2;
    let s2;
    let b2;
    let t2;
    if (optionalInput1 !== undefined) {
      diced2 = optionalInput1.split('d');
      sliced2 = diced2[1].split(diced1[1].includes('+') ? '+' : '-');

      n2 = diced2[0];
      t2 = diced2[1].includes('!') ? 'explode' : 'standard';
      s2 = t2 === 'explode' ? sliced2[0].split('!')[0] : sliced2[0];
      b2 = diced2[1].includes('+') ? sliced2[1] : -sliced2[1];
    }

    await interaction.reply(`${optionalInput1 ? 'First Roll: ' : 'Rolling: '}: ${requiredInput}${optionalInput1 ? `\nSecond Roll: ${optionalInput1}` : ''}`);
    let trait = await generate(n1, s1, t1, b1).catch(err => interaction.editReply(err));
    if (optionalInput1) {
      await generate(n2, s2, t2, b2).then(opt => {
        if (trait.length === 1 && opt.length === 1)
          if (trait.low === 1 && opt.low === 1) {
            interaction.editReply('Critical Failure');
            return;
          }
        console.log(opt)
        interaction.editReply(`**RESULT:**\n\n${requiredInput}: ${trait.total}\n${optionalInput1}: ${opt.total}`);
      }).catch(err => interaction.editReply(err));
    } else {
      interaction.editReply(`**RESULT:**\n\nTotal: ${trait.total}`)
    }
  },
};