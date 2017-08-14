var Sequelize = require('sequelize');

module.exports = function(db) {
	const client_event = db.define('client_event', {
		client_id: Sequelize.INTEGER,
		event_id: Sequelize.INTEGER
	});
	return client_event;
}