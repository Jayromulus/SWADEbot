const rollDice = require('./rollDice');

module.exports = (number, sides, bonus) => {
  let rolls = [];
  let high, low, length, total;

  for (let n = 0; n < number; n++) {
    let indiv = rollDice(sides);
    rolls.push(indiv);
  }

  total = rolls.reduce((a, b) => parseInt(a) + parseInt(b), 0);
	if (bonus) total += parseInt(bonus);
  low = Math.min(...rolls);
  high = Math.max(...rolls);
  length = rolls.length;

  return { high, low, length, rolls, total };
};
