module.exports = (inputs, results) => {
	let display;
	let buffer = [];

	results.forEach((roll, index) => buffer.push(`**${inputs[index]}:**\n- total: ${roll.total}\n- high: ${roll.high}\n- low: ${roll.low}\n- rolls: [${roll.rolls.join('], [')}]`));

	display = buffer.join('\n\n');

	return display;
};
