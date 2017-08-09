var router = require('express').Router();
var controller = require('./controllers/controller.js');
var templateController = require('./controllers/templateController.js');
var eventController = require('./controllers/eventController.js');



//Signup Route

router.route('/signup')
.post(function(req, res, next) {
	controller.addUser(req, res, function(data) {
		//TODO: Confirm whether question of success is required.
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});
//Sign in Route
router.route('/signin')
.post(function(req, res, next) {
	controller.checkUser(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
}); 

//Forgot Password

router.route('/forgot')
.post(function(req, res, next) {
	controller.forgotPassword(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

//Change password
router.route('/reset/:token')
.post(function(req, res, next) {
	controller.tokenCheck(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});


router.route('/reset/:token')
.post(function(req, res, next) {
	controller.changePassword(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});


//Check Session Routes

//Checks a user's session on every request after having signed in.
router.route('/*')
.post(function(req, res, next) {
	controller.checkSession(req, res, function(data) {
		console.log(req.session);
		if (data) {
			if (data.error) {
				res.status(500).send(data);
			}
			next();
		} else {
			res.status(401).send('You haven\'t logged in yet or your session has expired.');		
		}
	});
		
});

router.route('/*')
.post(function(req, res, next) {
	controller.checkSession(req, res, function(data) {
		console.log(req.session);
		if (data) {
			if (data.error) {
				res.status(500).send(data);
			}
			next();
		} else {
			res.status(401).send('You haven\'t logged in yet or your session has expired.');		
		}
	});
		
});

//Route for destroying session on logout.
router.route('/logout')
.post(function(req, res, next) {
	req.session = null;
	res.status(201).send('logout');
});

//Template Routes

router.route('/template/create')
.post(function(req, res, next) {
	templateController.addTemplate(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/template/apply')
.post(function(req, res, next) {
	templateController.applyTemplate(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/template/getAll')
.post(function(req, res, next) {
	templateController.getAllTemplates(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/template/delete')
.post(function(req, res, next) {
	templateController.deleteTemplate(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/template/update')
.post(function(req, res, next) {
	templateController.updateTemplate(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

//Event Routes
router.route('/event/add')
.post(function(req, res, next) {
	eventController.addEvent(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/event/send')
.post(function(req, res, next) {
	eventController.sendEvent(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/event/getAllEvents')
.post(function(req, res, next) {
	eventController.getAllEvents(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/event/getAllInvites')
.post(function(req, res, next) {
	eventController.getAllInvites(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/event/accept')
.post(function(req, res, next) {
	eventController.acceptInvite(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

//Client Management Routes
router.route('/client/add')
.post(function(req, res, next) {
	controller.addClient(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/client/getAll')
.post(function(req, res, next) {
	controller.getAllClients(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

router.route('/client/delete')
.post(function(req, res, next) {
	controller.deleteClient(req, res, function(data) {
		if (data.error) {
			res.status(500).send(data);
		}
		res.status(201).send(data);
	});
});

module.exports = router;