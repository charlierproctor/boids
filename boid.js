var coords = require('./coords'), object = require('./object');
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

boid.prototype.tick = function(boids,objs){
	var localBoids = this.findLocalBoids(boids);
	if (localBoids.length > 0) {
		var avgPos = localBoids.averagePosition();
		this.align(localBoids);
		this.cohere(avgPos);
		this.separate(avgPos);
	}
	this.navigateObjects(this.findLocalObjects(objs));

	this.move()
}

Array.prototype.findLocals = function(boid){
	return this.filter(function(obj){
		var angTo = boid.pos.angleTo(obj.pos);
		return boid.pos.x && boid.pos.y && obj.pos.x && obj.pos.y 
		&& Math.sqrt(Math.pow(boid.pos.x - obj.pos.x, 2) + Math.pow(boid.pos.y - obj.pos.y, 2)) < boid.locals.radius
		&& (angTo < boid.locals.angle && - boid.locals.angle < angTo)
		&& boid.id != obj.id;
	})
}

boid.prototype.findLocalBoids = function(boids){
	return boids.arr.findLocals(this);
}

boid.prototype.findLocalObjects = function(objs){
	return objs.arr.findLocals(this);
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
	var angle = this.cohesionStrength * rangify(this.pos.angleTo(avgPos) + Math.PI / 2 - this.heading);
	this.heading = rangify(this.heading + angle);
}

boid.prototype.separate = function(avgPos){
	var angle = this.separationStrength * rangify(this.pos.angleTo(avgPos) + Math.PI - this.heading);
	this.heading = rangify(this.heading + angle);
}

boid.prototype.navigateObjects = function(localObjects){
	for (var i = 0; i < localObjects.length; i++) {
		var obj = localObjects[i];
		var angle
		if (obj.strength < 0) {
			angle = rangify(this.pos.angleTo(obj.pos) - this.heading);
		} else {
			angle = rangify(this.pos.angleTo(obj.pos) + Math.PI / 2 - this.heading);
		}

		angle *= obj.strength;
		this.heading = rangify(this.heading + angle);
	}
}

boid.prototype.move = function(){
	this.pos.x += this.speed * Math.sin(this.heading);
	this.pos.y += this.speed * Math.cos(this.heading);
	this.pos.checkBounds()
}

// force angles between -Math.PI and Math.PI
function rangify(angle){
	if (angle < 0){
		var res = (angle - Math.PI) % (2 * Math.PI) + Math.PI;	
	} else {
		var res = (angle + Math.PI) % (2 * Math.PI) - Math.PI;
	}
	return res
}

module.exports = boid;
