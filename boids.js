var boid = require('./boid'), coords = require('./coords');

function boids(canvas, num, opts){
	this.num = num;
	this.arr = [];
	this.createBoids(canvas,opts);
}

boids.prototype.createBoids = function(canvas,opts){
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

boids.prototype.draw = function(ctx){
	this.arr.forEach(function(boid){
		boid.draw(ctx)
	});
}

boids.prototype.tick = function(objs){
	for (var i = 0; i < this.arr.length; i++) {
		this.arr[i].tick(this,objs);
	};
}

module.exports = boids;