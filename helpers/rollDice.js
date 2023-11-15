module.exports = (base, bonus = 0) => {
  let rand = Math.floor(Math.random() * base + 1) + bonus;
  return rand;
};
