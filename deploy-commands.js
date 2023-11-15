require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	if(file !== 'weapons.js' && file !== 'trait.js') {
		const command = require(`./commands/${file}`);
  	commands.push(command.data.toJSON());
	}
};

// Construct and prepare an instance of the REST module, this is used to update the commands through the discord api
const rest = new REST({ version: '10' }).setToken(process.env.PROD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // update commands for a client (application) in a given guild (server), remove the guild to just affect the client as a whole
    await rest.put(Routes.applicationGuildCommands(process.env.PROD_CLIENT, process.env.PROD_GUILD), { body: [] })
      .then(() => console.log('Successfully deleted all guild commands.'))
      .catch(console.error);

    // after setting the command list to empty, update it again using the new commands list as the body
    const data = await rest.put(Routes.applicationGuildCommands(process.env.PROD_CLIENT, process.env.PROD_GUILD), { body: commands });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();


// run `node deploy-commands.js` in your project directory to register your commands to the guild specified.
