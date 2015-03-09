var ticker, canvas, ctx, theBoids;
window.onload = function(){
	ticker = require('ticker');
	
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	theBoids = new boids(100);
	ctx = canvas.getContext('2d');
	ticker(window, 60).on('tick', tick).on('draw', draw)
}

function tick(){
}

function draw(){
	theBoids.draw();
}

function boids(num){
	this.arr = [];
	for (var i = 0; i < num; i++) {
		this.arr.push(new boid(
			new coords(
				Math.random() * canvas.width, 
				Math.random() * canvas.height), 
			2 * Math.random() * Math.PI)
		)
	};
}

boids.prototype.draw = function(){
	this.arr.forEach(function(boid){
		boid.draw();
	})
}

function boid(pos,heading){
	this.pos = pos;
	this.heading = heading;
}

var base = 10, height = 20;
boid.prototype.draw = function(){
	var pts = [
		new coords(0, height / 2),
		new coords(base / 2, -height / 2),
		new coords(-base / 2, -height / 2)
	];
	for (var i = 0; i < pts.length; i++) {
		pts[i].rotate(this.heading);
		pts[i].add(this.pos);
	};

	ctx.beginPath();
	ctx.moveTo(pts[0].x,pts[0].y);
	ctx.lineTo(pts[1].x,pts[1].y);
	ctx.lineTo(pts[2].x,pts[2].y);
	ctx.closePath();
	ctx.stroke();
};

boid.prototype.tick = function(boids){
	var locals = this.findLocals(boids);
	this.averageHeading(locals);
	
}

var radius = 50;
boid.prototype.findLocals = function(boids){
	return boids.arr.filter(function(boid){
		return Math.sqrt(Math.pow(boid.pos.x, 2) + Math.pow(boid.pos.y, 2)) < radius;
	})
}

var avgStrength = 0.5;
boid.prototype.averageHeading = function(locals){
	var total = 0, count = 0;
	locals.forEach(function(boid){
		total += boid.heading;
		count++;
	})
	var avg = total / count;
	this.heading += avgStrength * (avg - this.heading);
}

function coords(x,y){
	this.x = x;
	this.y = y;
}

coords.prototype.add = function(coords){
	this.x += coords.x;
	this.y += coords.y;
}
coords.prototype.rotate = function(radians){
	var x = this.x * Math.cos(radians) - this.y * Math.sin(radians);
	var y = this.x * Math.sin(radians) + this.y * Math.cos(radians);
	this.x = x;
	this.y = y;
}
