const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weapons')
    .setDescription('gives you a list of weapons'),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    return await interaction.reply('testing weaponslist');
  }
}