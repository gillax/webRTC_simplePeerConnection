var express = require('express');
var http = require('http');
var app = express();

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app).listen(3000);
console.log('server start:', 3000);

var io = require('socket.io');
io = io.listen(server);

videoChat = io.sockets.on('connection', function(socket) {
  console.log("connect : " + socket);
  
  socket.on('message', function(data){
    var room;
    console.log("recieve : " + data);  
    //socket.broadcast.emit('message', data);
    room = socket.room;
    videoChat.to(room).emit('message', data);
  });
  //socket.on('disconnect', function(){
   // console.log("discon : " + socket);  
   // socket.broadcast.emit("disconnect", socket);
 // });
  socket.on('roomId', function(data){
    console.log("roomId : " + data);  
    socket.room = data;
    videoChat.to(data).emit('rooomId', socket + 'さんが入室');
    socket.join(data);
    //socket.broadcast.emit('roomId', data);
    videoChat.to(data).emit('roomId', socket + 'がきた');
  });
});

