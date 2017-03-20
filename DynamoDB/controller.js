const dynamodb = require('./userTable');
const tdynamodb = require('./tokenTable');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer')
var settings = require("./settings.js")
var crypto = require("crypto")
var passport = require("passport"),
LocalStrategy = require('passport-local').Strategy,
FacebookStrategy = require('passport-facebook').Strategy,
TwitterStrategy = require('passport-twitter').Strategy;



var AWS = require("aws-sdk");

AWS.config.update(settings);

var docClient = new AWS.DynamoDB.DocumentClient();

//Create the following controllers

//addUser for sign up
exports.addUser = function(req,res,callback) {


	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		if(err) {
			console.error("Encryption Error", JSON.stringify(err,null,2))
		} else {
	  // Store hash in your password DB. 
			var params = {
				TableName: 'Users',
				Item: {
					"account": req.body.account,
					"email": req.body.email,
					"info": {
						//Hashed password
						"password": hash,
						"gender": req.body.gender,
						//Maybe ask birthday as well?
						"birthday": req.body.birthday
					}
				}
			}
		   
		   docClient.put(params, function(err, data) {
			   if (err) {
			      console.error("Unable to add item. Error JSON:");
			   } else {
			      console.log("Added item");
			      callback('You have signed up!')
			   }
			});
		}
	});
} 


//validateUser for signin
//requires account, email, and password
exports.checkUser = function(req, res, callback) {
	var params = {
		TableName: 'Users',
		Key: {
			"account": req.body.account,
			"email": req.body.email
		}
	}

	docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded", data.Item);
        //Comparing password
        bcrypt.compare(req.body.password, data.Item.info.password, function(err, res) {
	        if (err) {
	           console.error("Password Compare Error", JSON.stringify(err, null, 2));
	        } else {
	        	  //Sends back compare results to client.
	           callback(res);
	        }
		  });
    }
	});

}

//passwordReset
//requires account and email
exports.forgotPassword = function(req,res,callback) {

	crypto.randomBytes(20, function(err, buf) {
	  if(err) {
	  	console.error("Failed to generate reset token");
	  } else {
	  	var token = buf.toString('hex');

		        	var params = {
		        		TableName: 'Tokens',
		        		Item: {
		        			"account": req.body.account,
		        			"token": token,
		        			"info": {
		        				"passwordReset": token,
		        				"tokenExpire": Date.now() + 3600000,
		        				"email": req.body.email
		        			}
		        		}
		        	}
		           
		           docClient.put(params, function(err, data) {
		        	   if (err) {
		        	      console.error("Unable to add item. Error JSON:");
		        	   } else {
		        	      console.log("Added item", token);
		        	      let transporter = nodemailer.createTransport({
		        	          service: 'gmail',
		        	          auth: {
		        	              user: 'bagelbageltest@gmail.com', //Our public email address
		        	              pass: 'testtest8'//Password
		        	          }
		        	      });

		        	      // setup email data with unicode symbols
		        	      let mailOptions = {
		        	          from: '"Pursuit Health Technologies" <bagelbageltest@gmail.com>', // sender address
		        	          to: req.body.email, // list of receivers
		        	          subject: 'Password Reset', // Subject line
		        	          text: 'Click the following link to change your password: http://localhost:3000/reset/' + req.body.account + '/' + token, // plain text body
		        	          // html body
		        	      };

		        	      // send mail with defined transport object
		        	      transporter.sendMail(mailOptions, (error, info) => {
		        	          if (error) {
		        	              return console.log(error);
		        	          }
		        	          console.log('Message %s sent: %s', info.messageId, info.response);
		        	          callback("Email Sent!")
		        	      });
		        	   }
		        	});
	    }
	  })
};


//requires account, token, and new password from front end
exports.changePassword = function(req, res, callback) {
	var params = {
		TableName: 'Tokens',
		Key: {
			"account": req.body.account,
			"token": req.body.token
		}
	}

	docClient.get(params, function(err, data) {
	   if (err) {
	       console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
	   } else {
	      console.log("Query succeeded.", data);
         if(data.Item.info.tokenExpire > Date.now()) {
		     	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
		     		if(err) {
		     			console.error("Encryption Error", JSON.stringify(err,null,2))
		     		} else {
				     	var params = {
				     	    TableName: "Users",
				     	    Key:{
				     	        "account": req.body.account,
				     	        "email": data.Item.info.email
				     	    },
				     	    UpdateExpression: "set info.password = :p",
		     	          ExpressionAttributeValues: {
		     	             ":p": hash
		     	          },
				     	    ReturnValues:"UPDATED_NEW"
				     	};
				     	docClient.update(params, function(err, data) {
				     		if (err) {
				     		   console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
				     		} else {
				     		   
			    			}
			 	 		})
					}
				})
			} else {
				console.log("Token Expired");	
			}
			//Maybe send another email confirming password change
			var params = {
				TableName: "Tokens",
				Key : {
					"account" : req.body.account,
					"token" : req.body.token
				}
			}

			docClient.delete(params, function(err, data) {
				if (err) {
					console.error("Delete error")
				} else {
					console.log("Deleted token")
					callback('something')
				}
			})
   	}
	});

	//Check to see if token is valid

		//check if token exists and has not expired from DB.

		//if not valid, tell client token has expired

		//if valid, change password setup from request.

			//void token from token field


};
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://www.example.com/auth/twitter/callback" //TODO: Establish callback URL
  },
  function(token, tokenSecret, profile, done) {
    //TODO: Create and store appropriate data within DynamoDB
  }
));

//validateTwitterUser for twitter signin
exports.twitter = function(req, res, callback) {
	passport.authenticate('twitter');
	callback('asking for twitter info');
}

exports.twitterCallback = function(req, res, callback) {
	passport.authenticate('twitter', { successRedirect: '/',failureRedirect: '/login' });
	callback('checking if user was successful')

}

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "callbackURL" //TODO: Establish callback URL
  },
  function(accessToken, refreshToken, profile, done) {
      //TODO: Create and store appropriate data within DynamoDB
  }
));


//validateFacebookUser for facebook signin
exports.facebook = function(req, res, callback) {
	passport.authenticate('facebook')
	callback('asking for twitter info');
}

exports.facebookCallback = function(req, res, callback) {
	passport.authenticate('facebook', { successRedirect: '/',failureRedirect: '/login' });
	callback('checking if user was successful')
}






