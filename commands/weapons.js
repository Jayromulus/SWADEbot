const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const weapons = require('../assets/weapons.json');
const weaponNames = Object.keys(weapons);

const embed = (item, name) => {
  return new EmbedBuilder()
    .setColor(0x909cad)
    .setTitle(name)
    .setFooter({ text: item.source, iconURL: process.env.IMAGE })
    .addFields(
      { name: 'damage', value: item.damage, inline: true },
      { name: 'ap', value: item.ap.toString(), inline: true },
      { name: 'min str', value: item.min_str, inline: true },
      { name: 'range', value: item.range, inline: true },
      { name: 'rof', value: item.rof.toString(), inline: true },
      { name: 'shots', value: item.shots.toString(), inline: true },
      { name: 'notes', value: item.notes, inline: true },
      { name: 'blast', value: item.blast, inline: true },
    );
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weapon')
    .setDescription('gives you information about a weapon')
    .addStringOption(option =>
      option
        .setName('weapon')
        .setDescription('name of weapon to search')
        .setAutocomplete(true)
        .setRequired(true)),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const filtered = weaponNames.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));

    while (filtered.length > 25)
      filtered.pop();

    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    );
  },
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    let input, display;
    input = interaction.options.getString('weapon');

    display = embed(weapons[input], input);
    return await interaction.reply({ embeds: [display] });
  }
};

// honestly this entire command needs either removed or just straight up rewritten. it's probably all if not mostly garbage.
