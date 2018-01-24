const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express.static('public'));

var users = [];

app.get('/', function(req, res){
    res.render('index.html');
});
io.on('connection', function(socket){
    console.log('One client has connected!');

    socket.on('join chat', function (user) {
        console.log(user);
        users.push(user);
        io.sockets.emit('users', users);
    });

    socket.on('chat', function(data){

        for(var i=0; i < users.length; i++){
            if (users[i].chat_id == socket.id){
                senderInfo = users[i];
            }
        }
        
        //console.log(senderInfo);
        io.to(data.receiver_id).emit('chat', { receiver_id: socket.id, sender: senderInfo.username, msg: data.msg, align: "left"});
        io.to(socket.id).emit('chat', { receiver_id: data.receiver_id, sender: 'You', msg: data.msg, align: "right"});
    });


    socket.on('typing', function (user) {
        console.log(user);
        socket.broadcast.emit('typing', user)
         //io.sockets.emit('typing', user);
    });

});

http.listen(port, function(){
    console.log('App is running on port'+port);
});
