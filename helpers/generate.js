const explode = require('./explode'), standard = require('./standard');

module.exports = ({number, sides, type, bonus}) => {
	let result;

  if (type === 'explode') {
    result = explode(number, sides, bonus);
  } else {
    result = standard(number, sides, bonus);
  }

	return result;
};
