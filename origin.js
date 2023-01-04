require('dotenv').config();
const Discord = require('discord.js');
const { MessageActionRow, MessageButton, MessageEmbed,  } = require('discord.js');
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
  client.user.setActivity('?help for command list');
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
  const args = message.content.slice(process.env.PREFIX.length).trim().replace(/(\r\n|\n|\r)/gm, " ").split(/ +/g);
  // this will grab the command which is the first arg passed after the prefix
  const command = args.shift().toLowerCase();
  // switch through potential commands
  const lib = {
    'n': 1,
    's': 2,
    'v': 3,
    'h': 4,
    'l': 5,
  };
  let rank,points,charges;

  let helpTable = {
    weapons: '',
    roll: '',
    ouch: 'If you would like to calculate damage you take you can use the **ouch** command\n`?ouch <d> <t>`\n<d> is the amount of damage you are recieving\n<t> is your toughness\n\nThis command will tell you how many wounds you receive',
    scroll: 'Provides the price of a scroll\n`?scroll <rank> <points>`\n<rank> is the rank of the spell, only the first letter of a rank is required, though you may type the whole word\n<points> is the power point cost of the spell being put in the scroll',
    wand: 'Provides the cost of a **wand** being created\n`?wand <rank> <points> <charges>`\n<rank> is the rank of the spell being put in the wand, only the first letter of a rank is required, though you may type the whole word\n<points> is how much that spell costs to cast\n<charges> is how many charges the wand will have for use',
    deeznuts: '',
    help: '',
    other: '',
  }
  switch (command) {
    // ?help
    case 'help':
      let assist = args[0];
      if(!assist) {
        message.channel.send('Please type `?help <command>` where <command> is replaced by the command you would like to know more about');
        break;
      }

    //   // send a message detailing how to use the bot to the user
    //   message.channel.send('***SWADEbot is a dice roller app that helps you roll multiple dice, be they exploding or nay!***\n*NOTE: Anything inside of < > means it can be replaced with anything matching that pattern, e.g. `<#d#>` can be replaced with `1d6`. Anything with a `?` in front of it is an optional input*\n\n**ROLLING DICE**\nIn order to roll dice, all you have to do it type the command `?roll` followed by the number and type of dice you would like to roll.\n\n**EXAMPLE 1:**\n`?roll 1d6`\ngives you a number result of rolling one six-sided die\n*notation:* `?roll <#d#>`\n\n**EXAMPLE 2:**\n`?roll 1d8+2`\ngives you the combined result of an 8 sided die with the bonus of 2\n*notation:* `?roll <#d#+#>`\n\n**EXAMPLE 3:**\n`?roll 1d6 1d4`\nrolls 1d6 and 1d4 giving you both results as well as the total\n*notation:* `?roll <#d#> ?<#d#> ... ?<#d#+#>`\n\n**EXAMPLE 4:**\n`?roll shortsword 1d8!`\nrolls damage for a shortsword (1d6 + str) using 1d8 (exploding) as the strength score\n*notation:* `?roll <weapon> <strength> ?<extra dice>`\n\n**WEAPON LIST**\nto see a list of weapons, simply use the command\n`?weapons`\nthe weapons will show up in an embed with the name of a weapon listed above, the parameter taken by the bot will be listed below\ntherefore if the embed says\n\t\t**Billy Club**\n\t\t`billy_club`\nthe user must type `?roll billy_club <str>` in order to roll billy club damage\n\n**OUCH**\nif you would like to calculate damage you can use the ouch command\n`?ouch <d> <t>`\n\n**EXAMPLE:**\n`?ouch 26 4`\ntells you how many wounds you take/whether you are shaken taking `<d>`26 damage, with a `<t>` toughness of 4\n\n**SCROLL**\nfind the price of a scroll\n`?scroll <rank> <points>`\n<rank> is the rank of the spell, only the first letter of a rank is required to avoid typos, though you may type the whole word.\n<points> is the power point cost of the spell being put in the scroll\n\n**WANDS**\ncost of a wand being created\n`?wand <rank> <points> <charges>`\n<rank> is the rank of the spell being put in the wand\n<points> is how much that spell costs to cast\n<charges> is how many charges the wand will have for use\n\n**HELP**\nto see a list of commands, use the command\n`?help`\n*yes SWADEbot can see the irony in needing to use a command to see the list of commands*');
    //   break;
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
    case 'deeznuts':
      message.channel.send('https://giphy.com/gifs/deez-nuts-his-watermark-because-it-was-idea-my-brother-made-me-make-ESjyqZhDEpCo0');
      break;
    // ?ouch  {wounds} {toughness}
    case 'ouch':
      // console.log(args[0], args[1]);
      let potential = args[0] - args[1];
      let wounds = Math.floor(potential / 4);
      if(wounds === 0) {
        message.channel.send('You are shaken');
      } else {
        if(wounds > 4)
          message.channel.send(`YIKES! ${wounds} wounds`)
        else if(wounds === 1)
          message.channel.send(`${wounds} wound`)
        else
          message.channel.send(`${wounds} wounds`)
      }
      break;
    default:
      message.channel.send('https://tenor.com/view/youre-your-gif-22328611');
  }
});

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
