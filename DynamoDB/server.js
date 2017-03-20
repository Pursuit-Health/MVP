var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var routes = require('./routes.js');


app.use(bodyParser.json());
app.use(morgan());
//app.use(express.static(__dirname + '/../client/'));

app.use('/', routes);

app.listen(3000, ()=> {
  console.log('listening on port 3000');
});

