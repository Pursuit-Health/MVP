const dynamodb = require('../dbTables/userTable');
const tokendb = require('../dbTables/tokenTable');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const helper = require('../helper.js');




var AWS = require("aws-sdk");

AWS.config.update({
	region: "us-west-2",
	endpoint: "https://dynamodb.us-west-2.amazonaws.com",
	accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var docClient = new AWS.DynamoDB.DocumentClient();

//addUser for sign up
exports.addUser = function(req, res, callback) {


	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		if (err) {
			helper.sendResponse(callback, null, "Encryption Error", err);
		} else {
	  // Store hash in your password DB. 
			var params = {
				TableName: 'Users',
				Item: {
					email: req.body.email,
					type: "Personal",
					account: req.body.account,
					password: hash,
					gender: req.body.gender,
					birthday: req.body.birthday,
				}
			}; 
			docClient.put(params, function(err, data) {
				if (err) {
					helper.sendResponse(callback, null, "Unable to add item. Error JSON", err);
				} else {
					params = {
						TableName: 'Users',
						Item: {
							type: "Templates",
							email: req.body.email,
							info: [],
						}
					};
					docClient.put(params, function(err, data) {
						if (err) {
							helper.sendResponse(callback, null, "Unable to add item. Error JSON", err);
						} else {
							params = {
								TableName: 'Users',
								Item: {
									type: "Events",
									email: req.body.email,
									events: [],
									invites: []
								}
							};
							docClient.put(params, function(err, data) {
								if (err) {
									helper.sendResponse(callback, null, "Unable to add item. Error JSON", err);
								} else {
									if (req.body.account === "trainer") {
										params = {
											TableName: 'Users',
											Item: {
												type: "Clients",
												email: req.body.email,
												info: []
											}
										};
										docClient.put(params, function(err, data) {
											if (err) {
												helper.sendResponse(callback, null, "Unable to add item. Error JSON:", err);
											} else {
												helper.sendResponse(callback, true, "Trainer Added");
											}
										});	
									} else {
										helper.sendResponse(callback, true, "Client Added");
									}
								}
							});
						}
					});
				}
			});
		}
	});
}; 
//validateUser for signin
exports.checkUser = function(req, res, callback) {
	var params = {
		TableName: 'Users',
		Key: {
			"email": req.body.email,
			"type": "Personal"
		}
	};

	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to retrieve. Error JSON:", err);
		} else {
        //Comparing password
			bcrypt.compare(req.body.password, data.Item.password, function(err, auth) {
				if (err) {
					helper.sendResponse(callback, null, "Password Compare Error", err);
				} else {
					let salt = new Date();
					let saltString = data.Item.email + salt.toString();
					bcrypt.hash(saltString, saltRounds, function(err, hash) {
						console.log('hash', hash);
						var params = {
							TableName: 'Tokens',
							Item: {
								"token": hash,
								"type": 'cookie',
								"info": hash,
								"ttl": Math.floor((Date.now() + 60 * 60 * 1000) / 1000)
							}
						};
						docClient.put(params, function(err, data) {
							if (err) {
								helper.sendResponse(callback, null, "Session Store Problem", err);
							} else {
								req.session.id = hash;
				        		//Sends back compare results to client.
								helper.sendResponse(callback, true, 'User Checked', null, auth);
							}
						});
					} else {
						callback(JSON.stringify(auth));
					}
				}
			});
		}
	});
};

exports.checkSession = function(req, res, callback) {
	console.log(req.session);
	let params = {
		TableName: 'Tokens',
		Key: {
			"token": req.session.id,
			"type": 'cookie'
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Error checking session", err);
		} else {
			helper.sendResponse(callback, true, "Client Added", null, !!data.Item.info);
		}
	});
};

exports.tokenCheck = function(req, res, callback) {
	console.log(req.params.token);
	var params = {
		TableName: 'Tokens',
		Key: {
			"token": req.params.token,
			"type": 'reset'
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
		} else {
			console.log(data);
			if (data.Item.info) {
				res.render('reset', {
					token: data.Item.info.passwordReset
				});
			}
		}
	});
};

//passwordReset
//requires account and email
exports.forgotPassword = function(req, res, callback) {

	crypto.randomBytes(20, function(err, buf) {
		if (err) {
			helper.sendResponse(callback, null, "Failed to generate reset token", err);
		} else {
			var token = buf.toString('hex');

			var params = {
				TableName: 'Tokens',
				Item: {
					"token": token,
					"type": 'reset',
					"info": {
						"passwordReset": token,
						"tokenExpire": Date.now() + 3600000,
						"email": req.body.email
					},
					"ttl": Math.floor((Date.now() + 60 * 60 * 1000) / 1000)
				}
			};
		           
			docClient.put(params, function(err, data) {
				if (err) {
					helper.sendResponse(callback, null, "Store token error JSON:", err);
				} else {
					console.log("Added item", token);
					let transporter = nodemailer.createTransport({
						service: 'gmail',
						auth: {
							user: 'bagelbageltest@gmail.com', //Our public email address
							pass: 'testtest8'
						}
					});

					let mailOptions = {
						from: '"Pursuit Health Technologies" <andrew@pursuithealthtech.com>', // sender address
						to: req.body.email, // list of receivers
						subject: 'Password Reset', // Subject line
						text: 'Click the following link to change your password: ec2-52-23-153-110.compute-1.amazonaws.com/reset/' + token +
						'\n\n Please do not reply to this message. \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n', // plain text body
					};

		        	      // send mail with defined transport object
					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							helper.sendResponse(callback, null, "Email Error", error);
						}
						//console.log('Message %s sent: %s', info.messageId, info.response);
						helper.sendResponse(callback, true, "Email Sent");
					});
				}
			});
		}
	});
};


//requires account, token, and new password from front end
exports.changePassword = function(req, res, callback) {

	if (req.body.password !== req.body.confirm) {
		res.render('error', {
			token: req.params.token
		});
	} else {

		var params = {
			TableName: 'Tokens',
			Key: {
				"token": req.params.token,
				"type": 'reset'
			}
		};
		docClient.get(params, function(err, data) {
			if (err) {
				console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
			} else {
				console.log("Query succeeded.", data);
				if (data.Item.info.tokenExpire > Date.now()) {
					bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
						if (err) {
							console.error("Encryption Error", JSON.stringify(err, null, 2));
						} else {
							var params = {
								TableName: "Users",
								Key: {
									"email": data.Item.info.email,
									"type": "Personal"
								},
								UpdateExpression: "set password = :p",
								ExpressionAttributeValues: {
									":p": hash
								},
								ReturnValues: "UPDATED_NEW"
							};
							docClient.update(params, function(err, data) {
								if (err) {
									console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
								} else {
									console.log("password updated");
									helper.sendResponse(callback,true,'Password Updated')
								}
							});
						}
					});
				} else {
					res.render('expire');
					helper.sendResponse(callback,true,'Token Expire')
				}
				//Maybe send another email confirming password change
				var params = {
					TableName: "Users",
					Key: {
						"email": req.params.token,
						"type": 'reset'
					}
				};

				docClient.delete(params, function(err, data) {
					if (err) {
						console.error("Delete error");
					} else {
						console.log("Deleted token");
					}
				});
			}
		});
	}


};
// passport.use(new TwitterStrategy({
//     consumerKey: TWITTER_CONSUMER_KEY,
//     consumerSecret: TWITTER_CONSUMER_SECRET,
//     callbackURL: "http://www.example.com/auth/twitter/callback" //TODO: Establish callback URL
//   },
//   function(token, tokenSecret, profile, done) {
//     //TODO: Create table and store appropriate data within DynamoDB
//   }
// ));

// //validateTwitterUser for twitter signin
// exports.twitter = function(req, res, callback) {
// 	passport.authenticate('twitter');
// 	callback(JSON.stringify('asking for twitter info');
// }

// exports.twitterCallback = function(req, res, callback) {
// 	passport.authenticate('twitter', { successRedirect: '/',failureRedirect: '/login' });
// 	callback(JSON.stringify('checking if user was successful')

// }

// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: "callbackURL" //TODO: Establish callback URL
//   },
//   function(accessToken, refreshToken, profile, done) {
//       //TODO: Create table and store appropriate data within DynamoDB
//   }
// ));


// //validateFacebookUser for facebook signin
// exports.facebook = function(req, res, callback) {
// 	passport.authenticate('facebook')
// 	callback(JSON.stringify('asking for twitter info');
// }

// exports.facebookCallback = function(req, res, callback) {
// 	passport.authenticate('facebook', { successRedirect: '/',failureRedirect: '/login' });
// 	callback(JSON.stringify('checking if user was successful')
// }


//Client Management Functions

//add client
exports.addClient = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			"type": "Clients",
			"email": req.body.email
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to add item. Error JSON:", err);
		} else {
			data.Item.info.push(req.body.client);
			var clients = data.Item.info;
			var params = {
				TableName: "Users",
				Key: {
					"type": "Clients",
					"email": req.body.email
				},
				UpdateExpression: "set info = :i",
				ExpressionAttributeValues: {
					":i": clients,
				},
				ReturnValues: "UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					helper.sendResponse(callback, null, "Unable to add item. Error JSON:", err);
				} else {
					helper.sendResponse(callback, true, "Client added");
				}
			});	
		}
	});
};

//get all clients of trainer
exports.getAllClients = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			"email": req.body.email,
			"type": "Clients"
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to get clients", err);
		} else {
			helper.sendResponse(callback, true, "Password Updated", null, data.Item.info);
		}
	});
};

//delete a client
exports.deleteClient = function (req, res, callback) {
	//TODO: Delete query for trainer's client
	var params = {
		TableName: "Users",
		Key: {
			"type": "Clients",
			"email": req.body.email
		}
	};
	docClient.get(params, function(err, data) {
		if (err) {
			helper.sendResponse(callback, null, "Unable to find item. Error JSON:", err);
		} else {
			var clients = data.Item.info;
			clients.forEach(function(client, index) {
				if (client.fname === req.body.client.fname && client.lname === req.body.client.lname && client.img === req.body.client.img) {
					clients.splice(index, 1);
				}
			});
			var params = {
				TableName: "Users",
				Key: {
					"type": "Clients",
					"email": req.body.email
				},
				UpdateExpression: "set info = :i",
				ExpressionAttributeValues: {
					":i": clients,
				},
				ReturnValues: "UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					helper.sendResponse(callback, null, "Unable to delete item. Error JSON:", err);
				} else {
					helper.sendResponse(callback, true, "client deleted");
				}
			});	
		}
	 });
};








