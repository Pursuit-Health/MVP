//establish database connection
const Sequelize = require('sequelize');

//TODO: Add env vars for user/pw
const db = new Sequelize('PursuitHealth', process.ENV.username, process.ENV.password);

const tokens = require("./tokens")(db);
const clients = require("./clients")(db);
const trainers = require("./trainers")(db);
const templates = require("./templates")(db);
const exercises = require("./exercises")(db);
const events = require("./events")(db);
//-------------------------------------------------------
//TODO: Choose which type of join table
const template_user = require("./template_user")(db);
const event_user = require("./event_user")(db);

const trainer_event = require('./trainer_event')(db);
const client_event = require('./client_event')(db);
const trainer_template = require('./trainer_template')(db);
const client_template = require('./client_template')(db);
//--------------------------------------------------------
trainers.hasMany(clients, {as: 'clients'});
templates.hasMany(exercises, {as: 'exercises'});
templates.hasMany(template_user, {as: 'templateId'});
events.hasMany(event_user, {as: 'eventId'});

tokens.sync();
clients.sync();
trainers.sync();
templates.sync();
exercises.sync();
events.sync();

//-------------------------------------------------------
//TODO: Choose which type of join table
template_user.sync();
event_user.sync();

trainer_event.sync();
client_event.sync();
trainer_template.sync();
client_template.sync();
//-------------------------------------------------------

//TODO: add join table to export.
module.exports = {
	db,
	tokens,
	clients,
	trainers,
	templates,
	exercises,
	events,
};



