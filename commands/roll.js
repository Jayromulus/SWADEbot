const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

function rollDice(base, bonus) {
  let rand = Math.floor(Math.random() * base + 1) + (bonus ? bonus : 0);
  return rand;
};

//* REDO THIS TO TAKE IN 3 PARAMS: NUMER, SIDES, MODIFIER | COMMAND TAKES IN 3 PARAMS (2 MANDATORY 1 OPTIONAL) AND WILL RUN THAT WAY, THIS WILL REQUIRE REFACTORING THE GENERATOR
const generate = (dice) => {
  return new Promise((res, rej) => {
    // roll here
    try {
      let rolls = [];
      let operationList = [];

      // grab just the bonus from the end of any dice roll
      let operation = dice.includes('+') ? 'add' : dice.includes('-') ? 'sub' : '';
      operationList.push(operation);
      let rollMod = operation === 'add' ? dice.trim().split('+') : operation === 'sub' ? dice.trim().split('-') : [dice.trim(), ''];
      let bonus = parseInt(rollMod[1]);
      // get the number of and base of the die being rolled
      let numBase = rollMod[0].split('d');
      // console.log('numBase',numBase)
      // if the dice explode
      if (rollMod[0][rollMod[0].length - 1] === '!') {
        // track the current roll index
        let currentRoll = 0;
        // for as long as the current die index being rolled is lower than the number of dice being rolled
        while (currentRoll < numBase[0]) {
          // box to hold the values of the current dice and result from each roll
          let result;
          let currentDice = [];
          // roll the die of size provided by the args
          result = rollDice(parseInt(numBase[1]));
          // console.log('result:', result)
          // add the result into the roll list
          currentDice.push(result);
          // if the result is the same as the size of the die being rolled (meaning it is a max roll)
          while (result === parseInt(numBase[1])) {
            // reset result's value to a new roll and add it to the array of the current roll
            result = rollDice(parseInt(numBase[1]));
            currentDice.push(result);
          }
          // console.log(currentRoll)
          if (operation === 'add' && currentRoll === 0) {
            currentDice.push(Math.abs(parseInt(bonus)));
          } else if (operation === 'sub' && currentRoll === 0) {
            currentDice.push(-Math.abs(parseInt(bonus)));
          } else {
            currentDice.push(0);
          }
          // add the current dice to the rolls and iterate the current index
          rolls.push(currentDice);
          // console.log(currentDice);
          currentRoll++;
        }
        res(rolls.reduce((a, b) => a + b.reduce((c, d) => parseInt(c) + parseInt(d), 0), 0));
      } else {
        // roll as many dice as are provided in the args of a given size and add the results to the rolls
        for (let n = 0; n < numBase[0]; n++) {
          // console.log(n)
          let indiv = [];
          indiv.push(rollDice(parseInt(numBase[1])));
          // console.log('indiv:',indiv)
          if(n === 0) {
            indiv.push((operation === 'add' ? Math.abs(parseInt(bonus)) : operation === 'sub' ? -Math.abs(parseInt(bonus)) : 0))
          } else {
            indiv.push(0)
          }
          rolls.push(indiv);
          // console.log('rolls:',rolls);
        }
        res(rolls.reduce((a, b) => a + b.reduce((c, d) => parseInt(c) + parseInt(d), 0), 0));
      }
    } catch(e) {
      rej(e);
    }
  });
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Calculates the price of a provided wand')
    .addNumberOption(option =>
      option
        .setName('number')
        .setDescription('number of dice')
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('sides')
        .setDescription('size of each di(c)e')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('explode')
        .setDescription('decide if this roll explodes')
        .setChoices(
          { name: 'explode', value: 'explode' },
          { name: 'normal', value: 'normal' },
        )
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('modifier')
        .setDescription('modifier on the roll (optional)')),
	async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const pattern = /^\+?([1-9]\d*)d\+?([1-9]\d*)/gm;
    const input = `${interaction.options._hoistedOptions[0].value}d${interaction.options._hoistedOptions[1].value}${interaction.options._hoistedOptions[2].value === 'explode' ? '!' : ''}`;

    if(!pattern.test(input)) return interaction.reply(`does not match regex`);

    // send roll to an external function with a response being sent that says "Rolling..." and edits the text when the answer completes
		await interaction.reply(`Rolling...`);
    await generate(input).then(res => interaction.editReply(`total: ${res}`)).catch(err => interaction.editReply(err));
	},
};