var ticker, canvas, ctx, theBoids, boid, coords;
window.onload = function(){
	ticker = require('ticker');
	boid = require('./boid');
	coords = require('./coords');
	
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	theBoids = new boids(100, {
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
	theBoids.draw();
}

function boids(num, opts){
	this.num = num;
	this.arr = [];
	this.createBoids(opts);
}

boids.prototype.createBoids = function(opts){
	var id = 0;
	for (var i = 0; i < this.num; i++) {
		this.arr.push(new boid(
			id++,
			new coords(
				Math.random() * canvas.width, 
				Math.random() * canvas.height), 
			2 * Math.random() * Math.PI,
			opts)
		)
	};
}

boids.prototype.draw = function(){
	canvas.width = canvas.width; // clear the canvas
	this.arr.forEach(function(boid){
		boid.draw(ctx)
	});
}

boids.prototype.tick = function(){
	for (var i = 0; i < this.arr.length; i++) {
		this.arr[i].tick(this);
	};
}

