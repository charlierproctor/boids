var ticker, canvas, ctx, theBoids;
window.onload = function(){
	ticker = require('ticker');
	
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
		boid.draw()
	});
}

boids.prototype.tick = function(){
	for (var i = 0; i < this.arr.length; i++) {
		this.arr[i].tick(this);
	};
}

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

boid.prototype.draw = function(){
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
		this.averageHeading(locals);
		this.steerTowards(avgPos);
		this.avoid(avgPos);
	}
	this.moveForward()
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

Array.prototype.sumOfHeadings = function() {
  	return this.reduce(function(sumOfHeadings, a) { 
  		return sumOfHeadings + Number(a.heading) 
  	}, 0);
}

Array.prototype.averageHeading = function() {
  	return this.sumOfHeadings() / (this.length || 1);
}

boid.prototype.averageHeading = function(locals){
	if (locals.length > 0){
		this.heading += (this.alignmentStrength * (locals.averageHeading() - this.heading));
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

// force angles between - Math.PI and Math.PI
function rangify(angle){
	return (angle + Math.PI) % (2 * Math.PI) - Math.PI;
}

boid.prototype.steerTowards = function(avgPos){
	var angle = this.cohesionStrength * rangify(this.pos.angleTo(avgPos) - this.heading);
	this.heading = rangify(this.heading + angle);
}
boid.prototype.avoid = function(avgPos){
	var angle = this.separationStrength * rangify(this.pos.angleTo(avgPos) + Math.PI - this.heading);
	this.heading = rangify(this.heading + angle);
}

boid.prototype.moveForward = function(){
	this.pos.x -= this.speed * Math.sin(this.heading);
	this.pos.y += this.speed * Math.cos(this.heading);
	this.pos.checkBounds()
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
	var y = coords.y - this.y, x = coords.x - this.x;
	var res = Math.atan(y / x);
	if (x < 0) {
		if (y > 0){
			res += Math.PI;
		} else {
			res -= Math.PI;
		}
	}
	return res;
}
coords.prototype.checkBounds = function(){
	var height = window.innerHeight, width = window.innerWidth;
	if (this.x < 0){
		this.x += width;
	}
	if (this.y < 0){
		this.y += height
	}
	if (this.x > width){
		this.x -= width
	}
	if (this.y > height){
		this.y -= height
	}
}
