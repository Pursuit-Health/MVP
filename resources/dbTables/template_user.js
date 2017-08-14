var Sequelize = require('sequelize');

module.exports = function(db) {
	const template_user = db.define('template_user', {
		type: Sequelize.STRING,
		user_id: Sequelize.INTEGER
	});
	return template_user;
};