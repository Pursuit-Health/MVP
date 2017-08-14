var Sequelize = require('sequelize');

module.exports = function(db) {
	const Clients = db.define('Client', {
	  id: Sequelize.INTEGER,
	  username: Sequelize.STRING,
	  email: Sequelize.STRING,
	  password: Sequelize.BLOB,
	  });
	return Clients;
};