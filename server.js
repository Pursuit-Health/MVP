var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var routes = require('./resources/routes.js');
var helmet = require('helmet');
var cookieSession = require('cookie-session');
var path = require('path');


//TODO: Ensure TTL is enabled on the tokenTable to ensure that session storage of tokens do not live past maxAge.


//helps protect your app from some well-known web vulnerabilities by setting HTTP headers
app.use(helmet());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.static(__dirname + '/../client/'));

app.set('trust proxy', 1);

app.use(cookieSession({
	name: 'session',
	keys: ['trilogy', 'baseline'], //these keys should
	cookie: {
		secure: true,
		httpOnly: true,
		expires: new Date(Date.now() + 60 * 60 * 1000) 
	}
}));

app.use('/', routes);



app.listen(3000, () => {
  console.log('listening on port 3000');
});

