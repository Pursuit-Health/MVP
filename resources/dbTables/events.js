var Sequelize = require('sequelize');

module.exports = function(db) {
	const Events = db.define('Event', {
    id: Sequelize.INTEGER,
    name: Sequelize.STRING,
    start: Sequelize.STRING,
    end: Sequelize.STRING,
    location: Sequelize.STRING
	  });
	return Events;
};