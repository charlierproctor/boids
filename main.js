var ticker = require('ticker'), boids = require('./boids');
var canvas, ctx, theBoids;
window.onload = function(){
	ticker = require('ticker');
	
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	theBoids = new boids(canvas, 100, {
		speed: 5,
		alignmentStrength: 0.4,
		cohesionStrength: 0.1,
		separationStrength: 0.05,
		size: {
			base: 10,
			height: 20
		},
		locals: {
			radius: 50,
			angle: 0.9 * Math.PI
		}
	});
	ctx = canvas.getContext('2d');
	ticker(window, 60).on('tick', tick).on('draw', draw)
}

function tick(){
	theBoids.tick();
}

function draw(){
	theBoids.draw(canvas,ctx);
}
