require('dotenv').config();
const Discord = require('discord.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"], partials: ['MESSAGE', 'REACTION', 'CHANNEL'] });
const e = require('express');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('Running some test, hopefully.');
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(process.env.PREFIX) !== 0) return;
  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  //message.channel.send(`testing answer to: ${command}`);
  switch (command) {
    case 'roll':
      if (args[0] === 'help') {
        message.channel.send('SWADEbot is a dice roller app that helps you roll multiple dice, be they exploding or nay!\n\nROLLING DICE\nIn order to roll dice, all you have to do it type the command `?roll` followed by the number and type of dice you would like to roll.\n\nEXAMPLE 1:\n`?roll 1d6`\ngives you a number result of rolling one six-sided die\n\nEXAMPLE 2:\n`?roll 1d8+2`\ngives you the combined result of an 8 sided die with the bonus of 2\n\nEXAMPLE 3:\n`?roll 1d6 1d4`\nrolls 1d6 and 1d4 giving you both results as well as the total');
      } else {
        // ?roll 1d6: roll 1d6 non exploding | ?roll 1d6!: roll 1d6 exploding (on max roll another die of same size)
        let rolls = [];
        args.forEach(roll => {
          let rollMod = roll.trim().split('+');
          let bonus = parseInt(rollMod[1]);
          let numBase = rollMod[0].split('d');
          if (rollMod[0][rollMod[0].length - 1] === '!') {
            let currentRoll = 0;
            let currentDice = [];
            while (currentRoll < numBase[0]) {
              let result;
              result = rollDice(parseInt(numBase[1]));
              currentDice.push(result);
              while (result === parseInt(numBase[1])) {
                result = rollDice(parseInt(numBase[1]));
                currentDice.push(result);
              }
              currentRoll++;
            }
            rolls.push(currentDice)
          } else {
            let currentDice = [];
            for (let n = 0; n < numBase[0]; n++) {
              currentDice.push(rollDice(parseInt(numBase[1]), bonus));
            }
            rolls.push(currentDice);
          }
        })
        console.log(rolls);
// fix the issue where multiple dice rolls are not going to display in the same line, (maybe make an object each time you roll a section and reference the object according to the argument index?
        message.channel.send(`total: ${rolls.reduce((a, b) => parseInt(b) +  a.reduce((c,d) => parseInt(c) + parseInt(d)))}${rolls.map((r, i) => `\n${args[i]}: ${r}`).join('')}`);
      }
  }
});

function rollDice(base, bonus) {
  let rand = Math.floor(Math.random() * base + 1) + (bonus ? bonus : 0);
  return rand;
}

client.login(process.env.TOKEN);
