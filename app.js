var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var messages = [];

var storeMessage = function(name, data){

	//Add the messange to end of array
	messages.push({ name: name, data: data });

	//if more than 10 messages long, remove the first one
	if(messages.length > 10){
		messages.shift();
	}

};

io.on('connection', function(client){
	
	client.on('join', function(name){
		
		//Send the nickname associated with the client
		client.nickname = name;
		client.broadcast.emit("chat", name + " joined the chat");

		//iterate through messages array and emit a message on the connecting client for each one
		messages.forEach(function(message){
			client.emit("messages", message.name + ": " + message.data + "<br>");
		});
	
	});

	client.on('messages', function(message){ 

		//Get the nickname of this client before broadcasting message
		var nickname = client.nickname;

		//Broadcacst with the name and message
		client.broadcast.emit("messages", nickname + ": " + message + "<br>");

		//Send the same message back to our client
		client.emit("messages", nickname + ": " + message + "<br>");

		//When client sends a message call storeMessage
		storeMessage(nickname, message);
	});
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.listen(8080);