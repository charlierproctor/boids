var coords = require('./coords');
function boid(id,pos,heading, opts){
	this.id = id;
	this.pos = pos;
	this.heading = heading;

	this.speed = opts.speed;
	this.alignmentStrength = opts.alignmentStrength;
	this.cohesionStrength = opts.cohesionStrength;
	this.separationStrength = opts.separationStrength;
	this.size = opts.size;
	this.locals = opts.locals;
}

boid.prototype.draw = function(ctx){
	var pts = [
		new coords(0, this.size.height / 2),
		new coords(this.size.base / 2, -this.size.height / 2),
		new coords(-this.size.base / 2, -this.size.height / 2)
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
	if (locals.length > 0) {
		var avgPos = locals.averagePosition();
		this.align(locals);
		this.cohere(avgPos);
		this.separate(avgPos);
	}
	this.move()
}

boid.prototype.findLocals = function(boids){
	var pos = this.pos, x = this.pos.x, y = this.pos.y, id = this.id;
	var radius = this.locals.radius, angle = this.locals.angle;
	return boids.arr.filter(function(boid){
		var angTo = pos.angleTo(boid.pos);
		return x && y && boid.pos.x && boid.pos.y 
		&& Math.sqrt(Math.pow(x - boid.pos.x, 2) + Math.pow(y - boid.pos.y, 2)) < radius
		&& (angTo < angle && - angle < angTo)
		&& id != boid.id;
	})
}

Array.prototype.averageHeading = function() {
  	return this.reduce(function(sum, boid) { 
  		return sum + boid.heading;
  	}, 0) / (this.length || 1);
}

boid.prototype.align = function(locals){
	this.heading += (this.alignmentStrength * (locals.averageHeading() - this.heading));
}

Array.prototype.averagePosition = function() {
	var sum = this.reduce(function(sum, boid) { 
  		return sum.add(boid.pos); 
  	}, new coords(0,0));
	var denom = this.length || 1;
  	return new coords(sum.x / denom, sum.y / denom);
}

boid.prototype.cohere = function(avgPos){
	var angle = this.cohesionStrength * rangify(this.pos.angleTo(avgPos) - this.heading);
	this.heading = rangify(this.heading + angle);
}

boid.prototype.separate = function(avgPos){
	var angle = this.separationStrength * rangify(this.pos.angleTo(avgPos) + Math.PI - this.heading);
	this.heading = rangify(this.heading + angle);
}

boid.prototype.move = function(){
	this.pos.x -= this.speed * Math.sin(this.heading);
	this.pos.y += this.speed * Math.cos(this.heading);
	this.pos.checkBounds()
}

// force angles between -Math.PI and Math.PI
function rangify(angle){
	return (angle + Math.PI) % (2 * Math.PI) - Math.PI;
}

module.exports = boid;
