var ticker, canvas, ctx;
window.onload = function(){
	ticker = require('ticker');
	
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	ctx = canvas.getContext('2d');
	ticker(window, 60).on('tick', tick).on('draw', draw)
}

var x;
function tick(){
	x = new boid(new coords(100,200),Math.PI / 2);
}

function draw(){
	x.draw();
}

function boid(coords,heading){
	this.coords = coords;
	this.heading = heading;
}

var base = 10, height = 20;
boid.prototype.draw = function(){
	var a = new coords(0, height / 2);
	a.rotate(this.heading);
	a.add(this.coords);
	var b = new coords(base / 2, -height / 2);
	b.rotate(this.heading);
	b.add(this.coords);
	var c = new coords(-base / 2, -height / 2);
	c.rotate(this.heading);
	c.add(this.coords);

	// console.log(a,b,c);
	ctx.beginPath();
	ctx.moveTo(a.x,a.y);
	ctx.lineTo(b.x,b.y);
	ctx.lineTo(c.x,c.y);
	ctx.closePath();
	ctx.stroke();
};

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
