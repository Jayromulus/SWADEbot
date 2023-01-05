require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"], partials: ['MESSAGE', 'REACTION', 'CHANNEL'] });
const weapons = require('./weapons.json');
let weaponsList = [];
weaponsList.push(...Object.keys(weapons).sort().filter(e => e.name !== ''));

// login to the client
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // register the activity tag of the bot
  client.user.setActivity('?help for command list');
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(process.env.PREFIX) !== 0) return;
  const args = message.content.slice(process.env.PREFIX.length).trim().replace(/(\r\n|\n|\r)/gm, " ").split(/ +/g);
  const command = args.shift().toLowerCase();

  switch (command) {
    // ?help
    case 'help':
      let assist = args[0];
      if (!assist) {
        message.channel.send('Please type `?help <command>` where <command> is replaced by the command you would like to know more about');
        break;
      }
    case 'deeznuts':
      message.channel.send('https://giphy.com/gifs/deez-nuts-his-watermark-because-it-was-idea-my-brother-made-me-make-ESjyqZhDEpCo0');
      break;
    default:
      message.channel.send('https://tenor.com/view/youre-your-gif-22328611');
  }
});


// login as and run the bot
client.login(process.env.TOKEN);
