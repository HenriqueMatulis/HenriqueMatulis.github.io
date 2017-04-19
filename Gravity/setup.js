var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || function(callback) {
            "use strict";
            window.setTimeout(callback, 1000 / 60); 
        };
        
        
        
var canvas = document.getElementById("canvasSimulation");
var overLayCanvas = document.getElementById("canvasOverLay");

function resizeCanvas() {
    canvas.width = overLayCanvas.width = window.innerWidth * 0.85;
    canvas.height = overLayCanvas.height = window.innerHeight ;
}


window.addEventListener('resize', resizeCanvas, false);
window.addEventListener('orientationchange', resizeCanvas, false);
resizeCanvas()

var context = canvas.getContext("2d");
context.font = "16px Arial";
context.fillStyle = "rgb(0,0,0)";
context.fillRect(0,0,canvas.width, canvas.height);

        
var timeScale = 300;
var timeStep = 30;