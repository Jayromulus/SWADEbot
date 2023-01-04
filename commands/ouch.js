const { SlashCommandBuilder } = require('discord.js');
const { cleanup } = require('../helpers');

const calcDamage = (tough, hurt) => {
  return Math.floor((hurt - tough) / 4);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ouch')
    .setDescription('determines wounds taken from damage source')
    .addNumberOption(option =>
      option
        .setName('toughness')
        .setDescription('Character\'s toughness')
        .setRequired(true)
        .setMinValue(0))
    .addNumberOption(option =>
      option
        .setName('damage')
        .setDescription('incoming damage')
        .setRequired(true)
        .setMinValue(0)),
  async execute(interaction) {
    if(!interaction.isChatInputCommand()) return;
    let toughness, damage;

    toughness = cleanup(interaction.options.getNumber('toughness'));
    damage = cleanup(interaction.options.getNumber('damage'));

    return await interaction.reply(`${calcDamage(toughness, damage)} wound(s)`);
  }
};