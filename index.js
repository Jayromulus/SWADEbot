require('dotenv').config();
const Discord = require('discord.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"], partials: ['MESSAGE', 'REACTION', 'CHANNEL'] });
const e = require('express');
const weapons = require('./weapons.json');
// the number of items shown in the weapons list embed
const w_embed_length = 15;
// create the regex pattern to recognize a die roll
const weaponPattern = /\d+d\d+!?/;
// get a list of all weapon names from the json
let weaponsList = [];
weaponsList.push(...Object.keys(weapons).sort().filter(e => e.name !== ''));

// login to the client
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // register the activity tag of the bot
  client.user.setActivity('Running some test, hopefully.');
})

// listen for a message to be sent in the channel, kind of a shotgun approach but it works well
client.on('messageCreate', async (message) => {
  // if the bot sent it then ignore the message
  if (message.author.bot) return;
  // if the message does not begin with the specified command prefix then ignore it
  if (message.content.indexOf(process.env.PREFIX) !== 0) return;
  // make a list of the original arguments sent to the bot, since the argument list is modified slightly throughout the process
  const origin_args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  // the argument list that is used by the bot and modified into the final product used to roll the dice or otherwise search
  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  // this will grab the command which is the first arg passed after the prefix
  const command = args.shift().toLowerCase();
  // switch through potential commands
  switch (command) {
    // ?help
    case 'help':
      // send a message detailing how to use the bot to the user
      message.channel.send('***SWADEbot is a dice roller app that helps you roll multiple dice, be they exploding or nay!***\n*NOTE: Anything inside of < > means it can be replaced with anything matching that pattern, e.g. `<#d#>` can be replaced with `1d6`. Anything with a `?` in front of it is an optional input*\n\n**ROLLING DICE**\nIn order to roll dice, all you have to do it type the command `?roll` followed by the number and type of dice you would like to roll.\n\n**EXAMPLE 1:**\n`?roll 1d6`\ngives you a number result of rolling one six-sided die\n*notation:* `?roll <#d#>`\n\n**EXAMPLE 2:**\n`?roll 1d8+2`\ngives you the combined result of an 8 sided die with the bonus of 2\n*notation:* `?roll <#d#+#>`\n\n**EXAMPLE 3:**\n`?roll 1d6 1d4`\nrolls 1d6 and 1d4 giving you both results as well as the total\n*notation:* `?roll <#d#> ?<#d#> ... ?<#d#+#>`\n\n**EXAMPLE 4:**\n`?roll shortsword 1d8!`\nrolls damage for a shortsword (1d6 + str) using 1d8 (exploding) as the strength score\n*notation:* `?roll <weapon> <strength> ?<extra dice>`\n\n**WEAPON LIST**\nto see a list of weapons, simply use the command\n`?weapons`\nthe weapons will show up in an embed with the name of a weapon listed above, the parameter taken by the bot will be listed below\ntherefore if the embed says\n\t\t**Billy Club**\n\t\t`billy_club`\nthe user must type `?roll billy_club <str>` in order to roll billy club damage\n\n**HELP**\nto see a list of commands, use the command\n`?help`\n*yes SWADEbot can see the irony in needing to use a command to see the list of commands*');
      break;
    // ?weapons
    case 'weapons':
      // grab the serach term from the argument list
      let search = args[0];
      // if the user has a specific search termn
      if (search) {
        // the current weapon will look in the json for the item entered by the user
        let current = weapons[search.toLowerCase()];
        if (current) {
          // map over the keys of the searched weapon and create embed field objects for each of them
          let currentFields = Object.keys(current).map(c => {
            // check to make sure that each current value is not either empty or the hnumber 0, as well as not showing the source (this will be in the footer)
            if (current[c] !== '' && current[c] !== 0 && c !== 'source') {
              return {
                name: c.split('_').join(' ').toUpperCase(),
                value: current[c] === -1 ? 'Special' : current[c].toString(),
                inline: true
              }
            }
          });
          // make a new discord embed
          let currentEmbed = new Discord.MessageEmbed()
            .setColor('#6C7079')
            .setTitle(search.split('_').join(' '))
            .setFooter({ text: weapons[search].source })
            .addFields(currentFields.filter(e => e !== undefined));
          message.channel.send({ embeds: [currentEmbed] });
          // "catch" in case the item is not in the json
        } else {
          message.channel.send(`could not find weapon ${search}`);
        }
        // if there is no search term, this will send out the whole list of items
      } else {
        // create the list of weapons from the list of keys in the weapons.json
        let weaponsList = [];
        weaponsList.push(...Object.keys(weapons).sort().filter(e => e.name !== ''));
        // grab the total number of pages according to the number of items needed in the embed
        const page_total = Math.ceil(weaponsList.length / w_embed_length);
        // create the initial embed
        let currentEmbed = weaponsEmbed(0, page_total, 0);

        // not very performant right now, but it works well to paginate the data and view it all
        // creating the initial forward and back buttons to be used in the embed actions
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
        // send the embed and add the button action row in case there are more weapons that can fit on one page
        const embedMessage = await message.channel.send({
          embeds: [currentEmbed],
          components: canFitOnOnePage
            ? []
            : [new MessageActionRow({ components: [forwardButton] })]
        })

        // if everything can fit on one page, just exit the function
        if (canFitOnOnePage) return

        // create an interaction collector to respond when someone clicks an action button
        const collector = embedMessage.createMessageComponentCollector({
          filter: ({ user }) => true
        })

        // set the current page number to 0
        let currentIndex = 0
        // when an interaction is made
        collector.on('collect', async interaction => {
          // if the back button is pressed, subtract from the starting point, otherwise add to the starting point of the display
          interaction.customId === backId ? (currentIndex -= w_embed_length) : (currentIndex += w_embed_length)
          // update the embed according to the interaction made
          await interaction.update({
            // create a new embed using the new starting position
            embeds: [weaponsEmbed(currentIndex, page_total, currentIndex)],
            components: [
              new MessageActionRow({
                components: [
                  // if we are on the first page do not show the back button
                  ...(currentIndex ? [backButton] : []),
                  // if we are on the last page do not show the forward button
                  ...(currentIndex + w_embed_length < weaponsList.length ? [forwardButton] : [])
                ]
              })
            ]
          })
        })
      }
      break;
    // ?roll
    case 'roll':
      // create the empty list of all rolls
      let rolls = [];
      let operationList = [];

      // if the first argument of rolls is a weapon in the json
      if (args[0] in weapons) {
        // grab the damage for the weapon from the json while removing it from the args, and split it up if there is a strength section in it
        let tempArgs = weapons[args.shift()].damage.split(',');
        // remove the strength from the args and store it
        let str = args.shift();
        // put the weapon damage back at the beginning of the array
        args.unshift(...tempArgs);
        // if there is a strength die required for the weapon damage
        if (str) {
          // temp is going to be the args array without the str string in it
          let temp = [...args.filter(e => e != 'str')];
          // empty the args array
          while (args[0]) { args.shift() };
          // then refill it with the temp array, now that it should only have dice in it
          while (temp[0]) { args.push(temp.shift()) };
          // grabs the weapon die from the end of the array, now that the array should only contain the weapon die, this is to make the next few lines more legible
          let weaponDie = args[0];
          // if the weapon includes a strength die and the strength die provided by the user is below the minimum strength
          if (weapons[origin_args[1]].damage.includes('str') && parseInt(weapons[origin_args[1]].min_str.split(/\D/)[1]) > parseInt(str.split(/\D/)[1])) {
            // remove the original weapon damage since we will need to downscale the die in accordance to the user's strength (CITATION NEEDED)
            let originDamage = args.pop();
            // debugging comparison
            // console.log(weapons[origin_args[1]].min_str.split(/\D/)[1] + '|' + str.split(/\D/)[1]);
            // add the reduced die to the front of the args array, with it exploding if the original damage was exploding
            args.unshift(weaponDie.split(/\D/)[0] + 'd' + str.split(/\D/)[1] + (originDamage.includes('!') ? '!' : ''));
          }
          // add the strength back into the args array after the first index, this is so the position is correct when displaying results
          args.splice(1, 0, str);
        }
      }
      // check if there is anything in the args that does not match the regex pattern
      let malformed = args.some(e => !weaponPattern.test(e));
      // if the args contain something that is malformed, send a message informing the user
      if (malformed) {
        message.channel.send('Invalid command syntax');
      } else {
        // begin rolling each set of dice in the args
        args.forEach(roll => {
          // grab just the bonus from the end of any dice roll
          let operation = roll.includes('+') ? 'add' : roll.includes('-') ? 'sub' : '';
          operationList.push(operation);
          let rollMod = operation === 'add' ? roll.trim().split('+') : operation === 'sub' ? roll.trim().split('-') : [roll.trim(), ''];
          let bonus = parseInt(rollMod[1]);
          // get the number of and base of the die being rolled
          let numBase = rollMod[0].split('d');
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
              // add the result into the roll list
              currentDice.push(result);
              // if the result is the same as the size of the die being rolled (meaning it is a max roll)
              while (result === parseInt(numBase[1])) {
                // reset result's value to a new roll and add it to the array of the current roll
                result = rollDice(parseInt(numBase[1]));
                currentDice.push(result);
              }
              if (operation === 'add') {
                currentDice.push(Math.abs(parseInt(bonus)));
              } else if (operation === 'sub') {
                currentDice.push(-Math.abs(parseInt(bonus)));
              } else {
                currentDice.push(0);
              }
              // add the current dice to the rolls and iterate the current index
              rolls.push(currentDice);
              // console.log(currentDice);
              currentRoll++;
            }
            // if the dice do not explode
          } else {
            // roll as many dice as are provided in the args of a given size and add the results to the rolls
            for (let n = 0; n < numBase[0]; n++) {
              // console.log(numBase)
              rolls.push([rollDice(parseInt(numBase[1])), (operation === 'add' ? Math.abs(parseInt(bonus)) : operation === 'sub' ? -Math.abs(parseInt(bonus)) : 0)]);
              console.log(rolls);
            }
          }
        });
        // create the base of the message which includes the total of all rolls, we will add each individual roll onto this later
        let msg = `total: ${rolls.reduce((a, b) => a + b.reduce((c, d) => parseInt(c) + parseInt(d), 0), 0)}`;
        // check if the user rolled for a weapon, instead of just rolling dice first
        let weaponRoll = !weaponPattern.test(origin_args[1]);
        // run through the list of roll results
        // operationList.shift()
        // operationList.forEach((e, i) => {
        //   console.log('roll:', rolls[i])
        //   rolls[i].pop();
        // });
        rolls.forEach(r => r.pop());
        console.log('rolls:', rolls);
        args.map((a, i) => {
          // console.log(operationList.includes('add') || operationList.includes('sub'), rolls)
          // the base display will show either the weapon name, if there is was one provided, the strength label if that is part of the weapon damage, or the dice rolled
          let display = `\n${weaponRoll && i === 0 ? origin_args[1] : weaponRoll && weapons[origin_args[1]].damage.includes('str') && i === 1 ? 'strength' : a}: `;
          //  grab each individual array from the roll results, then combines them and seperates each seperate seperate die result for clarity
          for (let n = 0; n < a.split(/\D/)[0]; n++) {
            let temp = rolls.shift();
            // console.log(temp)
            // join each explosion with a comma
            display += temp.join(', ');
            // if n is lower than the number of dice in the roll, seperate each roll with a |
            if (n < a.split(/\D/)[0] - 1) display += ' | ';
          }
          // add the display for that die onto the message that will be sent
          msg += display;
        });
        // if the message is over the discord message length limit, just send the total without the individual dice, otherwise send the whole message
        if (msg.length > 1000) {
          message.channel.send(`total: ${rolls.reduce((a, b) => a + b.reduce((c, d) => parseInt(c) + parseInt(d), 0), 0)}`);
          while (operationList[0]){
            operationList.shift();
          }
        } else {
          message.channel.send(msg);
          while (operationList[0]){
            operationList.shift();
          }
        }
      }
      break;
    // add a feature where if there is a typo then it suggests the closest spelled command with the same params?
    default:
      console.log('how did you get here?');
  }
});

// function to roll dice using the base size as the limit then adding the bonus if any is provided
function rollDice(base, bonus) {
  let rand = Math.floor(Math.random() * base + 1) + (bonus ? bonus : 0);
  return rand;
}

// create the weapon embed using the starting index, while also taking in the total number and current pages as parameters for the footer
function weaponsEmbed(start, pages, currentPage) {
  // create the list of embed fields and the limit of how many fields to create according to the starting index and length of the embed
  let list = [];
  let limit = (start + w_embed_length <= weaponsList.length) ? start + w_embed_length : weaponsList.length - 1;

  // starting at a certain index, go through the json and create a new field object until you hit the limit
  // THIS MIGHT BE A PLACE TO IMPROVE PERFORMANCE INSTEAD OF REFERENCING THE JSON EACH TIME POSSIBLY MAKING IT A GLOBAL (?)
  for (let i = start; i <= limit; i++) {
    list.push({
      name: weapons[weaponsList[i]].name,
      value: '`' + weaponsList[i] + '`',
      inline: true
    });
    if (i !== 0 && ((limit % 2 == 0) ? i % 2 === 0 : i % 2 === 1) && i !== limit - 1) {
      list.push({
        name: '\u200b',
        value: '\u200b',
        inline: true
      })
    };
  }

  // create the discord embed with the fields from above in order to return
  let embed = new Discord.MessageEmbed()
    .setColor('#6C7079')
    .setTitle('Weapon Parameters')
    .setFooter({ text: `page ${Math.ceil(currentPage / w_embed_length) + 1} / ${pages}` })
    .addFields(list.filter(e => e.name !== '' && e.value !== ''));

  return embed;
}

// login as and run the bot
client.login(process.env.TOKEN);
