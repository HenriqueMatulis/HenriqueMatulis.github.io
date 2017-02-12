var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || function(callback) {
            "use strict";
            window.setTimeout(callback, 1000 / 60); 
        };
        
        
        
var canvas = document.getElementById("myCanvas");
var overLayCanvas = document.getElementById("canvasOverLay");
canvas.width = overLayCanvas.width = window.innerWidth * 0.85;
canvas.height = overLayCanvas.height = window.innerHeight ;
var context = canvas.getContext("2d");
context.font = "16px Arial";
context.fillStyle = "rgb(0,0,0)";
context.fillRect(0,0,canvas.width, canvas.height);