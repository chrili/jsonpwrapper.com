var sys = require('sys');
var http = require('http');
var fs = require('fs');
var URL = require('url');

var express = require('express');
var app = express();

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({dumpExceptions:true, showStack:true}));
});

function fetch(uri, callback) {
	if (uri.indexOf('http') !== 0) {
		uri = 'http://' + uri;
	}
	var url = URL.parse(uri, true);

	var result = '';

	http.get(url.href, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			result += chunk;
		}).on('end', function() {
			callback(result);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});
}

app.get('/', function(request, response) {
	response.sendfile('public/index.html');
});

app.get('/url/:target', function(request, response) {
	var callbackParam = request.query.callback;

	fetch(request.params.target, function(data){
		response.contentType(".js");
		
		if(callbackParam) {
			response.write(callbackParam);
			response.write('(');
		}

		response.write(data);

		if(callbackParam) {
			response.write(')');
		}

		response.end();
	});

});

app.get('/*', function(request, response) {
	response.sendfile('public/' + request.url);
});

app.listen(parseInt(process.env.PORT || 8000));
