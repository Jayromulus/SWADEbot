const rollDice = require('./rollDice');

module.exports = (number, sides, bonus) => {
  let rolls = [];
  let currentRoll = 0;
  let calculate, high, highRolls, lowRolls, low, length, total;

  while (currentRoll < number) {
    let result;
    let currentDice = [];

    result = rollDice(sides);
    currentDice.push(result);

    while (result === parseInt(sides)) {
      result = rollDice(sides);
      currentDice.push(result);
    }

    rolls.push(currentDice);
    currentRoll++;
  }
  if (bonus) rolls.push([bonus]);

  calculate = rolls.flat();
  total = calculate.reduce((a, b) => parseInt(a) + parseInt(b), 0);
  reducedRolls = rolls.map(r => r.reduce((a, b) => parseInt(a) + parseInt(b), 0));
  low = Math.min(...reducedRolls.flat());
  high = Math.max(...reducedRolls.flat());
  length = rolls.length;

  return { high, low, length, rolls, total };
};