exports.sendResponse = (callback, status, message, error, data) => {
	let res = {}

	if (status) {
		res.status = 'Success';
		res.message = message;
		if (data) {
			res.data = data;
		}
	} else {
		res.status = 'Error';
		res.error = error;
	}

	callback(JSON.stringify(res));
};