var Sequelize = require('sequelize');

module.exports = function(db) {
	const trainer_template = db.define('trainer_template', {
		trainer_id: Sequelize.INTEGER,
		template_id: Sequelize.INTEGER
	});
	return trainer_template;
}