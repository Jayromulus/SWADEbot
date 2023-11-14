const explode = require('./explode'), standard = require('./standard');

module.exports = ({number, sides, type, bonus}) => {
  return new Promise(async (res, rej) => {
    try {
      if (type === 'explode') {
        let result = await explode(number, sides, bonus);
        res(result);
      } else {
        let result = await standard(number, sides, bonus);
        res(result);
      }
    } catch (e) {
      rej(e);
    }
  })
};
