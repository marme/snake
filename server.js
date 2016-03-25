var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var point;
var width = 450;
var height = 450; 
var cell = 10;
var count = 2;

var snakes = {};

app.get('/', function(req, res){
res.sendFile(__dirname + '/snake.html');
});

app.get('/snake.js', function(req, res){
res.sendFile(__dirname + '/snake.js');
});


io.on('connection', function(socket){
console.log('new player:' + socket.id);
  socket.on('point', function(p){
	if(p || !point) {
		create_point();
	}
    	console.log('new point' + JSON.stringify(point));
	io.emit('point', point);
  });

  socket.on('move', function(arr) {
  	snakes[socket.id] = arr;
	io.emit('update', snakes);
  });

  socket.on('disconnect', function(){
  	console.log('player left:' + socket.id);
	if(socket.id in snakes){
		delete snakes[socket.id];
		io.emit('update', snakes);
	}
  });

if(!point) {
	create_point();
}
io.emit(point);
});

http.listen(5000, function(){
  console.log('listening on *:5000');
});

function create_point(x,y)
{
	if(!point){
		for(var i =0; i < count; i++){
		p = {
		x: Math.round(Math.random()*(width-cell)/cell), 
		y: Math.round(Math.random()*(height-cell)/cell), 
		};
		point[i] = p;
		}
	} else {
		for(var i =0; i < count; i++){
			if(point[i].x == x && point[i].y == y){
				point[i]= {
					x: Math.round(Math.random()*(width-cell)/cell), 
					y: Math.round(Math.random()*(height-cell)/cell), 
				};
			}	
		}
	}
}
