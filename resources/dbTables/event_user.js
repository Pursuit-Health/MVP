var Sequelize = require('sequelize');

module.exports = function(db) {
	const event_user = db.define('event_user', {
		event_id: Sequelize.INTEGER,
		type: Sequelize.STRING,
		user_id: Sequelize.INTEGER
	});
	return event_user;
};