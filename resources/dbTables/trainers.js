var Sequelize = require('sequelize');

module.exports = function(db) {
	const Trainers = db.define('Trainer', {
		id: Sequelize.INTEGER,
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.BLOB
	});
	return Trainers;
};