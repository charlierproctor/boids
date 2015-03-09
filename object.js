var coords = require('./coords');

function object(id,pos,opts){
	this.id = id;
	this.pos = pos;
	this.strength = opts.strength;
	this.shape = opts.shape;
}

object.prototype.draw = function(ctx){
	ctx.beginPath();
	ctx.ellipse(this.pos.x, this.pos.y, this.shape.radius, this.shape.radius, 0, 0, 2 * Math.PI);
	ctx.stroke();
};

module.exports = object;