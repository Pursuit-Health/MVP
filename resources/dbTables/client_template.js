var Sequelize = require('sequelize');

module.exports = function(db) {
	const client_template = db.define('client_template', {
		client_id: Sequelize.INTEGER,
		template_id: Sequelize.INTEGER
	});
	return client_template;
}