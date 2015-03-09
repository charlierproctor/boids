var coords = require('./coords');

function object(id,pos,strength){
	this.id = id;
	this.pos = pos;
	this.strength = strength;
}

module.exports = object;