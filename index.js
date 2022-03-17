require('dotenv').config();
const Discord = require('discord.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"], partials: ['MESSAGE', 'REACTION', 'CHANNEL'] });
const e = require('express');
const weapons = require('./weapons.json');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('Running some test, hopefully.');
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(process.env.PREFIX) !== 0) return;
  const origin_args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  switch (command) {
    case 'help':
      message.channel.send('**SWADEbot is a dice roller app that helps you roll multiple dice, be they exploding or nay!**\n*NOTE: Anything inside of < > means it can be replaced with anything matching that pattern, e.g. `<#d#>` can be replaced with `1d6`. Anything with a `?` in front of it is an optional input*\n\nROLLING DICE\nIn order to roll dice, all you have to do it type the command `?roll` followed by the number and type of dice you would like to roll.\n\nEXAMPLE 1:\n`?roll 1d6`\ngives you a number result of rolling one six-sided die\n*notation:* `?roll <#d#>`\n\nEXAMPLE 2:\n`?roll 1d8+2`\ngives you the combined result of an 8 sided die with the bonus of 2\n*notation:* `?roll <#d#+#>`\n\nEXAMPLE 3:\n`?roll 1d6 1d4`\nrolls 1d6 and 1d4 giving you both results as well as the total\n*notation:* `?roll <#d#> ?<#d#> ... ?<#d#+#>`\n\nEXAMPLE 4:\n`?roll shortsword 1d8!`\nrolls damage for a shortsword (1d6 + str) using 1d8 (exploding) as the strength score\n*notation:* `?roll <weapon> <strength> ?<extra dice>`');
      break;
    case 'weapons':
      let weaponsList = [];
      weaponsList.push(...Object.keys(weapons).sort());
      message.channel.send(weaponsList.join('\t'));
      break;
    case 'roll':
      let rolls = [];
      if (args[0] in weapons) {
        let tempArgs = weapons[args[0]].split(',');
        args.shift();
        let str = args.shift();
        args.unshift(...tempArgs);
        if (str) {
          let temp = [...args.filter(e => e != 'str')];
          while (args[0]) { args.shift() };
          while (temp[0]) { args.unshift(temp.shift()) };
          let weaponDie = args[args.length - 1];
          console.log('pre:', args);
          console.log(weaponDie.split(/\D/)[1]);
          //    console.log('pre-args:', args, parseInt(weaponDie[weaponDie.length - 1]) > parseInt(str[str.length - 1]), weaponDie.slice(0, -1) + str[str.length - 1]);
          // rework this to adjust for the ! on eac wepon die, but probably wait until readjusting to the new object witht he proper minstrength property?
          if (parseInt(weaponDie.split(/\D/)[1]) > parseInt(str[str.length - 1])) {
            args.pop();
            console.log(weaponDie.split(/\D/)[1] + str[str.length - 1]);
            args.unshift(weaponDie.split(/\D/)[1] + str[str.length - 1]);
            console.log('post:', args);
          }
          //	console.log('args:',args);
          args.push(str);
        }
      }
      let exp = /[0-9]d[0-9]+/;
      //let exp = /^\dd\d{1,6}$/;
      //console.log('premalf:', args);
      let malformed = args.some(e => !exp.test(e));
      //console.log('malformed:', malformed);
      //console.log('test:', exp.test(args[0]), exp.test(args[1]));
      if (malformed) {
        message.channel.send('Missing Strength Parameter');
      } else {
        args.forEach(roll => {
          let rollMod = roll.trim().split('+');
          let bonus = parseInt(rollMod[1]);
          let numBase = rollMod[0].split('d');
          if (rollMod[0][rollMod[0].length - 1] === '!') {
            let currentRoll = 0;
            while (currentRoll < numBase[0]) {
              let result;
              let currentDice = [];
              result = rollDice(parseInt(numBase[1]));
              currentDice.push(result);
              while (result === parseInt(numBase[1])) {
                result = rollDice(parseInt(numBase[1]));
                currentDice.push(result);
              }
              rolls.push(currentDice);
              currentRoll++;
            }
          } else {
            for (let n = 0; n < numBase[0]; n++) {
              rolls.push([rollDice(parseInt(numBase[1]), bonus)]);
            }
          }
        })
        let msg = `total: ${rolls.reduce((a, b) => a + b.reduce((c, d) => parseInt(c) + parseInt(d), 0), 0)}`;
        args.map((a, i) => {
          let weaponTest = /\D/;
          let weaponRoll = weaponTest.test(origin_args[0]);
          let display = `\n${weaponRoll && i === 0 ? origin_args[1] : a}: `;
          for (let n = 0; n < a.split(/\D/)[0]; n++) {
            //console.log('rolls:', rolls);
            let temp = rolls.shift();
            //console.log('temp:', temp, a[0], a.split(/\D/)[0]);
            display += temp.join(', ');
            //console.log(n < a.split(/\D/)[0]);
            if (n < a.split(/\D/)[0] - 1) display += ' | ';
          }
          msg += display;
        });
        if (msg.length > 4000) {
          message.channel.send(`total: ${rolls.reduce((a, b) => a + b.reduce((c, d) => parseInt(c) + parseInt(d), 0), 0)}`);
        } else {
          message.channel.send(msg);
        }
      }
      break;
    default:
      console.log('how did you get here?');
  }
});

function rollDice(base, bonus) {
  let rand = Math.floor(Math.random() * base + 1) + (bonus ? bonus : 0);
  return rand;
}

client.login(process.env.TOKEN);
