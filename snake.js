$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var context = canvas.getContext("2d");
	var width = $("#canvas").width();
	var height = $("#canvas").height();
	var cell = 10;
	var direction;
	var point;
	
	var snake_array;
	var opponents;

	var socket = io();
	socket.on('point', function(p){
		point = p;
	});

	socket.on('update', function(snakes){
		opponents = snakes;
	});

	function init()
	{
		direction = "right";
		create_snake(0,Math.round(Math.random()*(height-cell)/cell));
		if(!point) {
			create_point();
		}
	
		//init game loop if not set
		if(typeof game_loop == "undefined") {
			game_loop = setInterval(paint, 100);
		}

	}
	init();
	
	function create_snake(x, y)
	{
		var length = 5;
		snake_array = [];
		for(var i = length-1; i>=0; i--) {
			snake_array.push({x: x+i, y:y});
		}
	}
	
	function create_point(x,y)
	{
		socket.emit('point', {x:x, y:y});
	}
	
	function paint()
	{
		context.fillStyle = "white";
		context.fillRect(0, 0, width, height);
		context.strokeStyle = "black";
		context.strokeRect(0, 0, width, height);
		
		var newx = snake_array[0].x;
		var newy = snake_array[0].y;

		if(direction == "right") newx++;
		else if(direction == "left") newx--;
		else if(direction == "up") newy--;
		else if(direction == "down") newy++;
		
		//check collision
		if(newx == -1 || newy == -1 || 
		   newx == width/cell  || newy == height/cell || 
		   check_collision(newx, newy, snake_array)) {
			init();
			return;
		}
		
		//check if snake captured a point
		if(newx == point.x && newy == point.y) {
			var tail = {x: newx, y: newy};
			create_point();
		} else {
			var tail = snake_array.pop();
			tail.x = newx; 
			tail.y = newy;
		}
		
		snake_array.unshift(tail);
		
		socket.emit('move', snake_array);

		//paint snake
		for(var i = 0; i < snake_array.length; i++)
		{
			var c = snake_array[i];
			paint_cell(c.x, c.y, "blue");
		}
		
		for(var key in opponents){
			if(key.includes(socket.id))
				continue;
			for(var i = 0; i < opponents[key].length; i++)
                	{
                        	var c = opponents[key][i];
                        	paint_cell(c.x, c.y, "red");
                	}

		}

		//paint point
		for(var i = 0; i < point; i++){
			paint_cell(point[i].x, point[i].y, "blue");	
		}
		
	}
	
	function paint_cell(x, y, color)
	{
		context.fillStyle = color;
		context.fillRect(x*cell, y*cell, cell, cell);
		context.strokeStyle = "white";
		context.strokeRect(x*cell, y*cell, cell, cell);
	}
	
	function check_collision(x, y, array)
	{
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
                for(var key in opponents){
                        if(key.includes(socket.id))
                                continue;
                        for(var i = 0; i < opponents[key].length; i++)
                        {
                                var c = opponents[key][i];
                                if(c.x == x && c.y == y)
					return true;
                        }

                }


		return false;
	}
	
	function check_capture(x,y)
	{
		for(var i = 0; i < point; i++){
			if(x == point[i].x && y == point[i].y) {
				create_point(x,y);
			} 	
		}
	}
	
	$(document).keydown(function(e){
		var key = e.which;

		if(key == "37" && direction != "right") direction = "left";
		else if(key == "38" && direction != "down") direction = "up";
		else if(key == "39" && direction != "left") direction = "right";
		else if(key == "40" && direction!= "up") direction = "down";
	})

})
