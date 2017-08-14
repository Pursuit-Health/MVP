var Sequelize = require('sequelize');

module.exports = function(db) {
	const trainer_event = db.define('trainer_event', {
		trainer_id: Sequelize.INTEGER,
		event_id: Sequelize.INTEGER
	});
	return trainer_event;
}