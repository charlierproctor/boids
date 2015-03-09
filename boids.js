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
	x = new boid(100,200);
}

function draw(){
	x.draw();
}

function boid(posx,posy){
	this.posx = posx;
	this.posy = posy;
}

var base = 10, height = 20;
boid.prototype.draw = function(){

	ctx.beginPath();
	ctx.moveTo(this.posx,this.posy);
	ctx.lineTo(this.posx+b,this.posy+a);
	ctx.lineTo(this.posx+d,this.posy+c);
	ctx.closePath();
	ctx.stroke();
};

function coords(x,y){
	this.x = x;
	this.y = y;
}

coords.prototype.rotate = function(radians){
	var x = this.x * Math.cos(radians) - this.y * Math.sin(radians);
	var y = this.x * Math.sin(radians) + this.y * Math.cos(radians);
	this.x = x;
	this.y = y;
}
