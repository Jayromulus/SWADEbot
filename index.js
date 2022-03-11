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
  switch(command) {
    case 'roll':
      // ?roll 1d6: roll 1d6 non exploding | ?roll 1d6!: roll 1d6 exploding (on max roll another die of same size)
      let rolls = [];
      args.forEach(roll => {
        let rollMod = roll.trim().split('+');
        let bonus = parseInt(rollMod[1]);
        let numBase = rollMod[0].split('d');
	if (rollMod[0][rollMod[0].length-1] === '!'){
          let currentRoll = 0;
          while(currentRoll < numBase[0]){
            let result;
            result = rollDice(parseInt(numBase[1]));
            rolls.push(result);
            while (result === parseInt(numBase[1])){
              result = rollDice(parseInt(numBase[1]));
              rolls.push(result);
            }
            currentRoll++;
        }
        } else {
          for(let n = 0; n < numBase[0]; n++){
            rolls.push(rollDice(parseInt(numBase[1]), bonus));
          }
        }
      })
      console.log(rolls);
      message.channel.send(`total: ${rolls.reduce((a,b) => a + b)}`);
  }
});

function rollDice(base, bonus) {
  let rand = Math.floor(Math.random() * base + 1) + (bonus ? bonus : 0);
  return rand;
}

client.login(process.env.TOKEN);
