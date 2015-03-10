var coords = require('./coords');

function object(id,pos,opts){
	this.id = id;
	this.pos = pos;
	this.strength = opts.strength;
	this.shape = opts.shape;
	this.maxStrength = opts.maxStrength;
}

object.prototype.draw = function(ctx){
	ctx.beginPath();
	ctx.ellipse(this.pos.x, this.pos.y, this.shape.radius, this.shape.radius, 0, 0, 2 * Math.PI);
	ctx.stroke();
	var red = 255, green = 255;
	if (this.strength < 0) {
		green -= Math.abs(this.strength / this.maxStrength) * 255;
	} else {
		red -= Math.abs(this.strength / this.maxStrength) * 255;
	}
	ctx.fillStyle = "rgb(" + Math.round(red) + "," + Math.round(green) + ",0)";
	ctx.fill();
	ctx.stroke()
	ctx.fillStyle = "black";

};

module.exports = object;