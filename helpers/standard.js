const rollDice = require('./rollDice');

module.exports = async (number, sides, bonus) => {
  let rolls = [];
  let high, low, length, total;

  for (let n = 0; n < number; n++) {
    let indiv = rollDice(sides);
    rolls.push(indiv);
    if (bonus) rolls.push(bonus);
  }

  if (bonus) rolls.push(bonus);

  total = rolls.reduce((a, b) => parseInt(a) + parseInt(b), 0);
  low = Math.min(...rolls);
  high = Math.max(...rolls);
  length = rolls.length;

  return { high, low, length, rolls, total };
};