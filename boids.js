window.onload = function(){
var ticker = require('ticker');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var x = 0, y = 0;
 
ticker(window, 60).on('tick', function() {
  x += Math.round(Math.random()*2-1)*10
  y += Math.round(Math.random()*2-1)*10
}).on('draw', function() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'white'
  ctx.fillRect(x, y, 10, 10)
})
}

