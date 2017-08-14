var Sequelize = require('sequelize');

module.exports = function(db) {
	const Tokens = db.define('Token', {
		token: Sequelize.STRING,
		username: Sequelize.STRING, //store username or userid?
		expire: Sequelize.STRING
	});
	return Tokens;
};