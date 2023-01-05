require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
};

// Construct and prepare an instance of the REST module
// const rest = new REST({ version: '10' }).setToken(process.env.PROD_TOKEN);
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // uncomment to make global ????
    // await rest.put(Routes.applicationGuildCommands(process.env.PROD_CLIENT), { body: [] })
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD), { body: [] })
      .then(() => console.log('Successfully deleted all guild commands.'))
      .catch(console.error);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD),
      // comment above and uncomment below to make comands global
      // Routes.applicationCommands(process.env.PROD_CLIENT),
      { body: commands },
    );

    // ${data.length}
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();


// run `node deploy-commands.js` in your project directory to register your commands to the guild specified.