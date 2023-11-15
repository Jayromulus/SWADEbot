module.exports = (input) => {
	let bonus, diced, number, sides, sliced, type;

	diced = input.split('d');
	sliced = diced[1].split(diced[1].includes('+') ? '+' : '-');

	number = diced[0];
	type = diced[1].includes('!') ? 'explode' : 'standard';
	sides = type === 'explode' ? sliced[0].split('!')[0] : sliced[0];
	bonus = diced[1].includes('+') ? sliced[1] : -sliced[1];

	return { number, type, sides, bonus };
};
