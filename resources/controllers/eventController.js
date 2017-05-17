const dynamodb = require('../dbTables/userTable');
var settings = require("../../settings.js");

var AWS = require("aws-sdk");

AWS.config.update(settings);

var docClient = new AWS.DynamoDB.DocumentClient();

// Each event object has:
// - date object or year, month, day, hours, min,etc (name of day like monday?)
// - title of event
// - names of trainees/trainers
// - duration (optional?)

//Each account should have an array of event objects to represent all the events per account.

/*
	The trainer event object should look as follows:
	{
		name: name,
		start time:  date object,
		end time: date object,
		location: location,
		clients: [array of client objects]
	}
	trainer/client object 
	{
		img:
		fname:
		lname:
		email:
	}
	

	The client event object should look as follows: 
	{
		name: name,
		start time:  date object,
		end time: date object,
		location: location,
		trainer: trainer object
	}
*/

/*
for add event, the request body should look as follows 
{
	email: client email,
	event: event object

}
*/


exports.addEvent = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			"type": "Events",
			"email": req.body.email
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			var event = req.body.event;
			var date = new Date();
			event.id = date.toString();
			data.Item.events.push(event);
			var Events = data.Item.events;
			var params = {
				TableName: "Users",
				Key: {
					"type": "Events",
					"email": req.body.email
				},
				UpdateExpression: "set events = :i",
				ExpressionAttributeValues: {
					":i": Events,
				},
				ReturnValues: "UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
				} else {
					console.log("template added");
					let index = data.Attributes.events.length;
					callback(JSON.stringify(data.Attributes.events[index]));
				}
			});	
		}
	});
};

/*
for sendEvent, request body should look as follows:
{
	email: client email,
	event: event object,
	trainer: trainer object

}
*/

exports.sendEvent = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			"type": "Events",
			"email": req.body.email
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			var event = req.body.event;
			event.clients = null;
			event.trainer = req.body.trainer;
			data.Item.invites.push(event);
			var invites = data.Item.invites;
			var params = {
				TableName: "Users",
				Key: {
					"type": "Events",
					"email": req.body.email
				},
				UpdateExpression: "set invites = :i",
				ExpressionAttributeValues: {
					":i": invites,
				},
				ReturnValues: "UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
				} else {
					console.log("template applied");
					callback("template applied");
				}
			});
		}
	});
};

/*
For acceptinvite, you need the following:
{
	client: client object,
	event: event object,
}
*/

exports.acceptInvite = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			"type": "Events",
			"email": req.body.client.email
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			var invites = data.Item.invites;
			var event;
			invites.forEach(function(invite, index) {
				if (invite.id === req.body.event.id) {
					event = invite;
					invites.splice(index, 1);
				}
			});
			var params = {
				TableName: "Users",
				Key: {
					"type": "Events",
					"email": req.body.client.email
				},
				UpdateExpression: "set invites = :i",
				ExpressionAttributeValues: {
					":i": invites,
				},
				ReturnValues: "UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
				} else {
					var params = {
						TableName: "Users",
						Key: {
							"type": "Events",
							"email": req.body.client.email
						}
					};
					docClient.get(params, function(err, data) {
						if (err) {
							console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
						} else {
							data.Item.events.push(event);
							var events = data.Item.events;
							var params = {
								TableName: "Users",
								Key: {
									"type": "Events",
									"email": req.body.client.email
								},
								UpdateExpression: "set events = :i",
								ExpressionAttributeValues: {
									":i": events,
								},
								ReturnValues: "UPDATED_NEW"
							};
							docClient.update(params, function(err, data) {
								if (err) {
									console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
								} else { 
									var params = {
										TableName: "Users",
										Key: {
											email: event.trainer.email,
											type: "Events"
										}
									};
									docClient.get(params, function(err, data) {
										if (err) {
											console.error("Unable to update event's clients", JSON.stringify(err, null, 2));
										} else {
											var events = data.Item.Events;
											events.forEach(function(ev, index) {
												if (ev.id === event.id) {
													ev.clients.push(req.body.client);
												}
											});
											var params = {
												TableName: "Users",
												Key: {
													"type": "Events",
													"email": event.trainer.email
												},
												UpdateExpression: "set events = :i",
												ExpressionAttributeValues: {
													":i": events,
												},
												ReturnValues: "UPDATED_NEW"
											};
											docClient.update(params, function(err, data) {
												if (err) {
													console.error("Unable to update event's clients", JSON.stringify(err, null, 2));
												} else {
													console.log("event clients updated");
													callback('invite accepted');
												}
											});
										}
									});  				  				
								}
							});	
						}
					});
				}
			});	
		}
	});
};

exports.getAllEvents = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			email: req.body.email,
			type: "Events"
		}
	};

	docClient.get(params, function(err, data) {
		if (err) {
			console.error("Unable to get all events", JSON.stringify(err, null, 2));
		} else {
			console.log('Got all events');
			callback(JSON.stringify(data.Item.events));
		}
	});
};

exports.getAllInvites = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			email: req.body.email,
			type: "Events"
		}
	};

	docClient.get(params, function(err, data) {
		if (err) {
			console.error("Unable to get all events", JSON.stringify(err, null, 2));
		} else {
			console.log('Got all events');
			callback(JSON.stringify(data.Item.invites));
		}
	});
};

/*
The delete event object should look as follows:
{
	event: event object,
	email: email,
	account: check if trainer or not
}
*/

exports.deleteEvent = function(req, res, callback) {
	//If trainer is deleting an event, we cycle through all the clients in the event and delete this event from each of the clients.
	if (req.body.account === "trainer") {
		var clients = req.body.event.clients;
		clients.forEach((client)=> {
			var params = {
				TableName: "Users",
				Key: {
					"type": "Events",
					"email": client
				}
			};
			docClient.get(params, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
				} else {
					var events = data.Item.events;
					events.forEach(function(event, index) {
						if (event.id === req.body.event.id ) {
							events.splice(index, 1);
						}
					});
					var params = {
						TableName: "Users",
						Key: {
							"type": "Events",
							"email": client
						},
						UpdateExpression: "set events = :i",
						ExpressionAttributeValues: {
							":i": events,
						},
						ReturnValues: "UPDATED_NEW"
					};
					docClient.update(params, function(err, data) {
						if (err) {
							console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
						} else {
							console.log("template added");
							callback("template added");
						}
					});	
				}
			});
		});
	} else {
		var params = {
			TableName: "Users",
			Key: {
				"type": "Events",
				"email": req.body.email
			}
		};
		docClient.get(params, function(err, data) {
			if (err) {
				console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
			} else {
				var events = data.Item.events;
				events.forEach(function(event, index) {
					if (event.id === req.body.event.id) {
						events.splice(index, 1);
					}
				});
				var params = {
					TableName: "Users",
					Key: {
						"type": "Events",
						 "email": req.body.email
					},
					UpdateExpression: "set events = :i",
					ExpressionAttributeValues: {
						 ":i": events,
					},
					ReturnValues: "UPDATED_NEW"
				};
				docClient.update(params, function(err, data) {
					if (err) {
						console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
					} else {
						console.log("template added");
						callback("template added");
					}
				});	
			}
		});
	}

};



