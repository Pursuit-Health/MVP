var Sequelize = require('sequelize');

module.exports = function(db) {
	const Exercises = db.define('Exercise', {
    id: Sequelize.INTEGER,
    name: Sequelize.STRING,
    sets: Sequelize.INTEGER,
    reps: Sequelize.INTEGER,
    weight: Sequelize.INTEGER
	  });
	return Exercises;
};