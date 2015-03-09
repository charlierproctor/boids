var ticker, canvas, ctx, theBoids;
window.onload = function(){
	ticker = require('ticker');
	
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	theBoids = new boids(50);
	ctx = canvas.getContext('2d');
	ticker(window, 60).on('tick', tick).on('draw', draw)
}

function tick(){
	theBoids.tick();
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
	canvas.width = canvas.width; // clear the canvas
	for (var i = 0; i < this.arr.length; i++) {
		this.arr[i].draw();
	};
}

boids.prototype.tick = function(){
	for (var i = 0; i < this.arr.length; i++) {
		this.arr[i].tick(this);
	};
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
	this.steerTowards(locals);
	this.moveForward()
}

var radius = 100;
boid.prototype.findLocals = function(boids){
	var x = this.pos.x, y = this.pos.y;
	return boids.arr.filter(function(boid){
		return boid.pos.x && boid.pos.y && Math.sqrt(Math.pow(x - boid.pos.x, 2) + Math.pow(y - boid.pos.y, 2)) < radius;	
	})
}

Array.prototype.sumOfHeadings = function() {
  	return this.reduce(function(sumOfHeadings, a) { 
  		return sumOfHeadings + Number(a.heading) 
  	}, 0);
}

Array.prototype.averageHeading = function() {
  	return this.sumOfHeadings() / (this.length || 1);
}

var avgHeadingStrength = 0.5;
boid.prototype.averageHeading = function(locals){
	if (locals.length > 0){
		this.heading += (avgHeadingStrength * (locals.averageHeading() - this.heading));
	}
}

Array.prototype.sumOfPositions = function() {
  	return this.reduce(function(sumOfPositions, boid) { 
  		return sumOfPositions.add(boid.pos); 
  	}, new coords(0,0));
}

Array.prototype.averagePosition = function() {
	var sum = this.sumOfPositions();
	var denom = this.length || 1;
  	return new coords(sum.x / denom, sum.y / denom);
}

var steerTowardsStrength = 0.1;
boid.prototype.steerTowards = function(locals){
	if (locals.length > 0) {
		var avgPos = locals.averagePosition();
		this.heading += steerTowardsStrength * this.pos.angleTo(avgPos);
	}
}

var speed = 1;
boid.prototype.moveForward = function(){
	this.pos.x -= speed * Math.sin(this.heading);
	this.pos.y += speed * Math.cos(this.heading);
}

function coords(x,y){
	this.x = x;
	this.y = y;
}

coords.prototype.add = function(coords){
	this.x += coords.x;
	this.y += coords.y;
	return this;
}
coords.prototype.rotate = function(radians){
	var x = this.x * Math.cos(radians) - this.y * Math.sin(radians);
	var y = this.x * Math.sin(radians) + this.y * Math.cos(radians);
	this.x = x;
	this.y = y;
}
coords.prototype.angleTo = function(coords){
	return Math.atan((coords.y - this.y) / (coords.x - this.x));
}
