var router = require('express').Router();
var controller = require('./controller.js');

//Signup Route
router.route('/signup')
.post(function(req, res, next) {
	controller.addUser(req, res, function(data) {
		//TODO: Confirm whether question of success is required.
		console.log('success')
		res.status(201).end('User Added');
	});
});


//Normal Signin
router.route('/signin')
.post(function(req, res, next) {
	controller.checkUser(req, res, function(data) {
		res.status(201).send(data);
	});
}); 

//Forgot Password

router.route('/forgot')
.post(function(req, res, next) {
	controller.forgotPassword(req, res, function(data) {
		res.status(201).send(data);
	});
});

router.route('/reset/:account/:token')
.post(function(req, res, next) {
	controller.changePassword(req, res, function(data) {
		res.status(201).send(data);
	});
});

router.route('/auth/facebook')
.get(function(req, res, next) {
	controller.facebook(req, res, function(data) {
		res.status(200).send(data);
	});
});

router.route('/auth/facebook/callback')
.get(function(req, res, next) {
	controller.facebookCallback(req, res, function(data) {
		res.status(200).send(data);
	});
});

router.route('/auth/twitter')
.get(function(req, res, next) {
	controller.twitter(req, res, function(data) {
		res.status(200).send(data);
	});
});

router.route('/auth/twitter/callback')
.get(function(req, res, next) {
	controller.twitterCallback(req, res, function(data) {
		res.status(200).send(data);
	});
});


module.exports = router;