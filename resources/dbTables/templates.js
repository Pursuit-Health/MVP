var Sequelize = require('sequelize');

module.exports = function(db) {
	const Templates = db.define('Template', {
		id: Sequelize.INTEGER,
		name: Sequelize.STRING,
		icon: Sequelize.STRING,
		duration: Sequelize.INTEGER //Seconds
	  });
	return Templates;
};