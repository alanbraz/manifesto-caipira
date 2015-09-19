/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express');

// setup middleware
var app = express();
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// render index page
app.get('/', function(req, res){
	res.render('slides');
});

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
//app.listen(port, host);
//console.log('App started on port ' + port);

var io = require('socket.io').listen(app.listen(port));

// This is a secret key that prevents others from opening your presentation
// and controlling it. Change it to something that only you know.
var secret = 'caipirada';

// Initialize a new socket.io application
var presentation = io.on('connection', function (socket) {
	// A new client has come online. Check the secret key and
	// emit a "granted" or "denied" message.
	socket.on('load', function(data){
		socket.emit('access', {
			access: (data.key === secret ? "granted" : "denied")
		});
	});

	// Clients send the 'slide-changed' message whenever they navigate to a new slide.
	socket.on('slide-changed', function(data){
		// Check the secret key again
		if(data.key === secret) {
			// Tell all connected clients to navigate to the new slide
			presentation.emit('navigate', {
				hash: data.hash
			});
		}
	});
});

console.log('Your presentation is running on http://localhost:' + port);
