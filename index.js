require('dotenv').config();
const Discord = require('discord.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"], partials: ['MESSAGE', 'REACTION', 'CHANNEL'] });
const e = require('express');
const weapons = require('./weapons.json');
const w_embed_length = 24;

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
      message.channel.send('***SWADEbot is a dice roller app that helps you roll multiple dice, be they exploding or nay!***\n*NOTE: Anything inside of < > means it can be replaced with anything matching that pattern, e.g. `<#d#>` can be replaced with `1d6`. Anything with a `?` in front of it is an optional input*\n\n**ROLLING DICE**\nIn order to roll dice, all you have to do it type the command `?roll` followed by the number and type of dice you would like to roll.\n\n**EXAMPLE 1:**\n`?roll 1d6`\ngives you a number result of rolling one six-sided die\n*notation:* `?roll <#d#>`\n\n**EXAMPLE 2:**\n`?roll 1d8+2`\ngives you the combined result of an 8 sided die with the bonus of 2\n*notation:* `?roll <#d#+#>`\n\n**EXAMPLE 3:**\n`?roll 1d6 1d4`\nrolls 1d6 and 1d4 giving you both results as well as the total\n*notation:* `?roll <#d#> ?<#d#> ... ?<#d#+#>`\n\n**EXAMPLE 4:**\n`?roll shortsword 1d8!`\nrolls damage for a shortsword (1d6 + str) using 1d8 (exploding) as the strength score\n*notation:* `?roll <weapon> <strength> ?<extra dice>`\n\n**WEAPON LIST**\nto see a list of weapons, simply use the command\n`?weapons`\n\n**HELP**\nto see a list of commands, use the command\n`?help`\n*yes SWADEbot can see the irony in needing to use a command to see the list of commands*');
      break;
    case 'weapons':
      let search = args[0];
      // console.log(search);
      if (search) {
        let current = weapons[search];
        let currentFields = Object.keys(current).map(c => {
          if (current[c] !== '' && current[c] !== 0 && c !== 'source') {
            return {
              name: c.split('_').join(' '),
              value: current[c].toString(),
              inline: true
            }
          }
        });
        //console.log('current:', currentFields)
        let currentEmbed = new Discord.MessageEmbed()
          .setColor('#6C7079')
          .setTitle(search.split('_').join(' '))
          .setFooter({ text: weapons[search].source })
          .addFields(currentFields.filter(e => e !== undefined));
        message.channel.send({ embeds: [currentEmbed] });
      } else {
        let weaponsList = [];
        weaponsList.push(...Object.keys(weapons).sort().filter(e => e.name !== ''));
        const page_total = Math.ceil(weaponsList.length / 24);
        let currentEmbed = weaponsEmbed(0, page_total, 0);

        // not very performant right now, but it works well to paginate the data and view it all
        const backId = 'back'
        const forwardId = 'forward'
        const backButton = new MessageButton({
          style: 'SECONDARY',
          label: 'Back',
          emoji: '⬅️',
          customId: backId
        })
        const forwardButton = new MessageButton({
          style: 'SECONDARY',
          label: 'Forward',
          emoji: '➡️',
          customId: forwardId
        })

        const canFitOnOnePage = weaponsList.length <= w_embed_length
        const embedMessage = await message.channel.send({
          embeds: [currentEmbed],
          components: canFitOnOnePage
            ? []
            : [new MessageActionRow({ components: [forwardButton] })]
        })
        // Exit if there is only one page of guilds (no need for all of this)
        if (canFitOnOnePage) return

        // Collect button interactions (when a user clicks a button),
        // but only when the button as clicked by the original message author
        const collector = embedMessage.createMessageComponentCollector({
          filter: ({ user }) => true
        })

        let currentIndex = 0
        collector.on('collect', async interaction => {
          // Increase/decrease index
          interaction.customId === backId ? (currentIndex -= w_embed_length) : (currentIndex += w_embed_length)
          // Respond to interaction by updating message with new embed
          await interaction.update({
            embeds: [weaponsEmbed(currentIndex, page_total, currentIndex)],
            components: [
              new MessageActionRow({
                components: [
                  // back button if it isn't the start
                  ...(currentIndex ? [backButton] : []),
                  // forward button if it isn't the end
                  ...(currentIndex + 24 < weaponsList.length ? [forwardButton] : [])
                ]
              })
            ]
          })
        })
      }
      break;
    case 'roll':
      let rolls = [];
      if (args[0] in weapons) {
        let tempArgs = weapons[args[0]].damage.split(',');
        args.shift();
        let str = args.shift();
        args.unshift(...tempArgs);
        if (str) {
          let temp = [...args.filter(e => e != 'str')];
          while (args[0]) { args.shift() };
          while (temp[0]) { args.push(temp.shift()) };
          let weaponDie = args[args.length - 1];
          if (parseInt(weapons[origin_args[1]].min_str.split(/\D/)[1]) > parseInt(str.split(/\D/)[1])) {
            args.pop();
            console.log(weapons[origin_args[1]].min_str.split(/\D/)[1] + '|' + str.split(/\D/)[1]);
            args.unshift(weaponDie.split(/\D/)[0] + 'd' + str.split(/\D/)[1]);
          }
          args.splice(1, 0, str);
        }
      }
      let exp = /[0-9]d[0-9]+/;
      let malformed = args.some(e => !exp.test(e));
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
          let display = `\n${weaponRoll && i === 0 ? origin_args[1] : weapons[origin_args[1]].damage.includes('str') && i === 1 ? 'strength' : a}: `;
          for (let n = 0; n < a.split(/\D/)[0]; n++) {
            let temp = rolls.shift();
            display += temp.join(', ');
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
    // add a feature where if there is a typo then it suggests the closest spelled command with the same params?
    default:
      console.log('how did you get here?');
  }
});

function rollDice(base, bonus) {
  let rand = Math.floor(Math.random() * base + 1) + (bonus ? bonus : 0);
  return rand;
}

function weaponsEmbed(start, pages, currentPage) {
  let weaponsList = [];
  weaponsList.push(...Object.keys(weapons).sort().filter(e => e.name !== ''));

  let list = [];
  let limit = (start + w_embed_length <= weaponsList.length) ? start + w_embed_length : weaponsList.length;

  for (let i = start; i < limit; i++) {
    list.push({
      name: weaponsList[i].split('_').join(' '),
      value: weapons[weaponsList[i]].source,
      inline: true
    })
  }

  let embed = new Discord.MessageEmbed()
    .setColor('#6C7079')
    .setTitle('Weapon Parameters')
    .setFooter({ text: `page ${Math.ceil(currentPage / w_embed_length) + 1} / ${pages}` })
    .addFields(list.filter(e => e.name !== '' && e.value !== ''));

  return embed;
}

client.login(process.env.TOKEN);
