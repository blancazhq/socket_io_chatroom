const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

app.get("/", function(req, res){
  res.sendFile(__dirname+"/main.html")
});

var people= [];

function Person (name, id){
  this.name = name;
  this.id = id;
}

io.on('connection', function(socket){
  socket.on("join", function(screenName){
    socket.screenName = screenName;
    var person = new Person(screenName, socket.id);
    people.push(person);
    io.emit("join", [socket.screenName, people])
  });

  socket.on("typing", function(msg){
    io.emit('typing', msg);
  })

  socket.on('chat message', function(array){
    var msg = array[0];
    var to = array[1];
    var introduction = socket.screenName+" to "+to+"(private): "
    if(to==="all"){
      io.emit('chat message', socket.screenName+": "+msg);
    }else{
      var id
      for(var i=0;i<people.length;i++){
        if(people[i].name===to){
          id = people[i].id;
        }
      }
      io.sockets.connected[socket.id].emit('chat message', introduction+msg)
      io.sockets.connected[id].emit('chat message', introduction+msg)
    }
  });

  socket.on('disconnect', function(){
    socket.broadcast.emit("leave", socket.screenName)
    for(var i=0;i<people.length;i++){
      if(people[i].id===socket.id){
        people.splice(i, 1);
      }
    }
  });
});

http.listen(3004, function(){
  console.log("listening on 3004...")
})
