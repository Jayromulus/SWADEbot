const { SlashCommandBuilder } = require('discord.js');
const weapons = require('../weapons.json');
const weaponNames = Object.keys(weapons);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weaponslist')
    .setDescription('view list of available weapons')
    .addStringOption(option => 
      option
        .setName('weapon')
        .setDescription('name of weapon to search')
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const filtered = weaponNames.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
    while (filtered.length > 25) {
      filtered.pop();
    }
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice }))
    )
  },
  async execute(interaction) {
    if(!interaction.isChatInputCommand()) return;
    await interaction.reply('testing weapons')
  }
};

