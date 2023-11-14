module.exports = function displayText(input1, input2 = []) {
	let display;
	display = `**${input1[0]}:**\n- total: ${input1[1].total}\n- high: ${input1[1].high}\n- low: ${input1[1].low}`;
	if(!input2.length) return display;
	display += `\n\n**${input2[0]}:**\n- total: ${input2[1].total}\n- high: ${input2[1].high}\n- low: ${input2[1].low}`;
	return display;
};
