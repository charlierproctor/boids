var object = require('./object'), coords = require('./coords');

function objects(canvas, num, opts){
	this.num = num;
	this.arr = [];
	this.createObjects(canvas,opts);
}

objects.prototype.createObjects = function(canvas,opts){
	var id = 0;
	for (var i = 0; i < this.num; i++) {
		opts.strength = Math.random() * 2 - 1;
		this.arr.push(new object(
			id++,
			new coords(
				Math.random() * canvas.width, 
				Math.random() * canvas.height), 
			opts)
		)
	};
}

objects.prototype.draw = function(ctx){
	this.arr.forEach(function(obj){
		obj.draw(ctx)
	});
}

module.exports = objects;