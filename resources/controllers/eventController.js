
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

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
		TableName: "Events",
		Key: {
			"email": req.body.email,
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to add item. Error JSON:", err);
		} else {
			var event = req.body.event;
			var date = new Date();
			event.id = date.toString();
			data.Item.events.push(event);
			var Events = data.Item.events;
			var params = {
				TableName: "Events",
				Key: {
					"email": req.body.email,
				},
				UpdateExpression: "set events = :i",
				ExpressionAttributeValues: {
					":i": events,
				},
				ReturnValues: "UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					helper.sendResponse(callback, null, "Unable to add item. Error JSON:", err);
				} else {
					console.log("template added");
					let index = data.Attributes.events.length;
					helper.sendResponse(callback, true, "Event Added", null, data.Attributes.events[index]);
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
		TableName: "Events",
		Key: {
			"email": req.body.email,
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to find item. Error JSON:", err);
		} else {
			var event = req.body.event;
			event.clients = null;
			event.trainer = req.body.trainer;
			data.Item.invites.push(event);
			var invites = data.Item.invites;
			var params = {
				TableName: "Events",
				Key: {
					"email": req.body.email,
				},
				UpdateExpression: "set invites = :i",
				ExpressionAttributeValues: {
					":i": invites,
				},
				ReturnValues: "UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					helper.sendResponse(callback, null, "Unable to update item. Error JSON:", err);
				} else {
					helper.sendResponse(callback, true, "event applied");
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
		TableName: "Events",
		Key: {
			"email": req.body.client.email,
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to find item. Error JSON:", err);
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
				TableName: "Events",
				Key: {
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
					helper.sendResponse(callback, null, "Unable to update item. Error JSON:", err);
				} else {
					var params = {
						TableName: "Events",
						Key: {
							"email": req.body.client.email
						}
					};
					docClient.get(params, function(err, data) {
						if (err) {
							helper.sendResponse(callback, null, "Unable to find item. Error JSON:", err);
						} else {
							data.Item.events.push(event);
							var events = data.Item.events;
							var params = {
								TableName: "Events",
								Key: {
									"email": req.body.client.email,
								},
								UpdateExpression: "set events = :i",
								ExpressionAttributeValues: {
									":i": events,
								},
								ReturnValues: "UPDATED_NEW"
							};
							docClient.update(params, function(err, data) {
								if (err) {
									helper.sendResponse(callback, null, "Unable to update item. Error JSON:", err);
								} else { 
									var params = {
										TableName: "Events",
										Key: {
											email: event.trainer.email,
										}
									};
									docClient.get(params, function(err, data) {
										if (err) {
											helper.sendResponse(callback, null, "Unable to update event's clients", err);
										} else {
											var events = data.Item.Events;
											events.forEach(function(ev, index) {
												if (ev.id === event.id) {
													ev.clients.push(req.body.client);
												}
											});
											var params = {
												TableName: "Events",
												Key: {
													"email": event.trainer.email,
												},
												UpdateExpression: "set events = :i",
												ExpressionAttributeValues: {
													":i": events,
												},
												ReturnValues: "UPDATED_NEW"
											};
											docClient.update(params, function(err, data) {
												if (err) {
													helper.sendResponse(callback, null, "Unable to update event's clients", err);
												} else {
													helper.sendResponse(callback, true, "event accepted");
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
		TableName: "Events",
		Key: {
			email: req.body.email,
		}
	};

	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to get all events", err);
		} else {
			console.log('Got all events');
			helper.sendResponse(callback, true, "got all events", null, data.Item.events);
		}
	});
};

exports.getAllInvites = function(req, res, callback) {
	var params = {
		TableName: "Events",
		Key: {
			email: req.body.email,
		}
	};

	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to get all events", err);
		} else {
			//console.log('Got all events');
			helper.sendResponse(callback, true, "got all invites", null, data.Item.invites);
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
				TableName: "Events",
				Key: {
					"email": client
				}
			};
			docClient.get(params, function(err, data) {
				if (err) {
					helper.sendResponse(callback, null, "Unable to find item", err);
				} else {
					var events = data.Item.events;
					events.forEach(function(event, index) {
						if (event.id === req.body.event.id ) {
							events.splice(index, 1);
						}
					});
					var params = {
						TableName: "Events",
						Key: {
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
							helper.sendResponse(callback, null, "Unable to delete item", err);
						} else {
							helper.sendResponse(callback, true, "event deleted");
						}
					});	
				}
			});
		});
	} else {
		var params = {
			TableName: "Events",
			Key: {
				"email": req.body.email,
			}
		};
		docClient.get(params, function(err, data) {
			if (err) {
				helper.sendResponse(callback, null, "Unable to find item", err);
			} else {
				var events = data.Item.events;
				events.forEach(function(event, index) {
					if (event.id === req.body.event.id) {
						events.splice(index, 1);
					}
				});
				var params = {
					TableName: "Events",
					Key: {
						 "email": req.body.email,
					},
					UpdateExpression: "set events = :i",
					ExpressionAttributeValues: {
						 ":i": events,
					},
					ReturnValues: "UPDATED_NEW"
				};
				docClient.update(params, function(err, data) {
					if (err) {
						helper.sendResponse(callback, null, "Unable to delete item", err);
					} else {
						console.log("template added");
						helper.sendResponse(callback, true, "event deleted");
					}
				});	
			}
		});
	}

};



