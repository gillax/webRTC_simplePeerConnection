var express = require('express')
,   http = require('http')
,   app = express()
;

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app).listen(3000);
console.log('server start:', 3000);

var io = require('socket.io')
,   io = io.listen(server)
;

io.sockets.on('connection', function(socket) {
  console.log("connect : " + socket);
  socket.on('message', function(data){
    console.log("recieve : " + data);  
    socket.broadcast.emit('message', data);
  });
});
