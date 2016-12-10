var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || function(callback) {
            "use strict";
            window.setTimeout(callback, 1000 / 60); 
        };
        
        
        
var canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth * 0.85;
canvas.height = window.innerHeight ;
var context = canvas.getContext("2d");
context.font = "16px Arial";