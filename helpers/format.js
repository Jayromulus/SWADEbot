module.exports = function format(malformed) {
	// split both the url and the id/params so that the 
	const fractured = malformed.split('/');
	const tail = fractured[fractured.length - 1].split('?');

	// throw an error if the link is malformed somehow
	if (!fractured[2].endsWith('.com')) throw new Error('malformed link');

	// replace the base url with vxtwitter and cut off extra params after the tweet id
	fractured[2] = 'vxtwitter.com';
	fractured[fractured.length - 1] = tail[0];

	// join together the newly formatted link
	const formatted = fractured.join('/');
	
	return formatted;
};
