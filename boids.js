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

boid.prototype.draw = function(){
	ctx.beginPath();
	ctx.moveTo(this.posx,this.posy);
	ctx.lineTo(this.posx+5,this.posy-10);
	ctx.lineTo(this.posx-5,this.posy-10);
	ctx.closePath();
	ctx.stroke();
};

