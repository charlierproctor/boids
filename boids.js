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
