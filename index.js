(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

	ctx.strokeStyle = "white";
	ctx.beginPath();
	ctx.moveTo(pts[0].x,pts[0].y);
	ctx.lineTo(pts[1].x,pts[1].y);
	ctx.lineTo(pts[2].x,pts[2].y);
	ctx.closePath();
	ctx.stroke();
	ctx.fillStyle = "white";
	ctx.fill();
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
	var angle = this.cohesionStrength * rangify(this.pos.angleTo(avgPos) - this.heading);
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
			angle = rangify(this.pos.angleTo(obj.pos)  - this.heading);
		} else {
			angle = rangify(this.pos.angleTo(obj.pos) - this.heading);
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

},{"./coords":3,"./object":6}],2:[function(require,module,exports){
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
},{"./boid":1,"./coords":3}],3:[function(require,module,exports){
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
	var y = coords.y - this.y, x = coords.x - this.x;
	var res = Math.atan(y / x);
	if (y < 0) {
		if (x > 0){
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
},{}],4:[function(require,module,exports){
var ticker = require('ticker'), boids = require('./boids'), objects = require('./objects');
var canvas, ctx, theBoids, theObjects;
window.onload = function(){
	ticker = require('ticker');
	
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	theBoids = new boids(canvas, 50, {
		speed: 3,
		alignmentStrength: 0.8,
		cohesionStrength: 0.1,
		separationStrength: 0.3,
		size: {
			base: 10,
			height: 20
		},
		locals: {
			radius: 50,
			angle: 0.9 * Math.PI
		}
	});
	theObjects = new objects(canvas, 20, {
		shape: {
			radius: 10
		}, 
		maxStrength: 0.1
	})
	ctx = canvas.getContext('2d');
	ticker(window, 60).on('tick', tick).on('draw', draw)
}

function tick(){
	theBoids.tick(theObjects);
}

function draw(){
	canvas.width = canvas.width; // clear the canvas
	theBoids.draw(ctx);
	theObjects.draw(ctx);
}

},{"./boids":2,"./objects":7,"ticker":5}],5:[function(require,module,exports){
(function (global){
var EventEmitter = require('events').EventEmitter

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame

module.exports = ticker

var currtime =
  global.performance &&
  global.performance.now ? function() {
    return performance.now()
  } : Date.now || function () {
    return +new Date
  }

function ticker(element, rate, limit) {
  var fps = 1000 / (rate || 60)
    , emitter = new EventEmitter
    , last = currtime()
    , time = 0

  var raf = _raf || function(fn, el) {
    setTimeout(fn, fps)
  }

  limit = arguments.length > 2 ? +limit + 1 : 2

  function loop() {
    raf(loop, element || null)

    var now = currtime()
    var dt = now - last
    var n = limit

    emitter.emit('data', dt)
    time += dt
    while (time > fps && n) {
      time -= fps
      n -= 1
      emitter.emit('tick', fps)
    }

    time = (time + fps * 1000) % fps
    if (n !== limit) emitter.emit('draw', time / fps)
    last = now
  }

  loop()

  return emitter
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"events":8}],6:[function(require,module,exports){
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
};

module.exports = object;
},{"./coords":3}],7:[function(require,module,exports){
var object = require('./object'), coords = require('./coords');

function objects(canvas, num, opts){
	this.num = num;
	this.arr = [];
	this.createObjects(canvas,opts);
}

objects.prototype.createObjects = function(canvas,opts){
	var id = 0;
	for (var i = 0; i < this.num; i++) {
		opts.strength = opts.maxStrength*(Math.random() * 2 - 1);
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
},{"./coords":3,"./object":6}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[4]);
