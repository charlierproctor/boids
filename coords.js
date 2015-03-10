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
	var x = this.x * Math.cos(radians) + this.y * Math.sin(radians);
	var y = this.x * Math.sin(radians) - this.y * Math.cos(radians);
	this.x = x;
	this.y = -y;
}
coords.prototype.angleTo = function(coords){
	var y = - (coords.y - this.y), x = coords.x - this.x;
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

module.exports = coords;