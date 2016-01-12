/*jslint white: true, eqeq: true, nomen: true, vars: true*/
var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {
    "use strict";
    window.setTimeout(callback, 1000/60); 
  };

var canvas= document.getElementById("myCanvas");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
var context = canvas.getContext("2d");

function Vector(xx, yy){
    "use strict";
    this.x=xx;
    this.y=yy;
    
    this.add=function(vector){
        this.x+=vector.x;
        this.y+=vector.y;
    };
    this.add2=function(v1, v2){
        var v = new Vector(v1.x, v1.y);
        v.add(v2);
        return v;
    };
    
    this.sub=function(v1){
        this.x-=v1.x;
        this.y-=v1.y;
    };
    
    this.sub2=function(v1, v2){
        var v = new Vector(v1.x, v1.y);
        v.sub(v2);
        return v;
    };
    
    this.mag=function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };
    
    this.normalize=function(){
        var m= this.mag();
        this.x=this.x/m;
        this.y=this.y/m;
    };
    
    this.dot=function(vector){
        return (this.x* vector.x +this.y*vector.y);
    };
    
    this.mult=function(scalar){
        this.x*=scalar;
        this.y*=scalar;
    };
    
    this.mult2=function(v1, s){
        var v = new Vector(v1.x, v1.y);
        v.mult(s);
        return v;
    };
    
    this.div=function(scalar){
        this.x/=scalar;
        this.y/=scalar;
    };
    
    this.div2=function(v1, s){
        var v = new Vector(v1.x, v1.y);
        v.div(s);
        return v;
    };
}


function Ball(xx,yy, rad, m){
    "use strict";
    this.location=new Vector(xx,yy);
    this.velocity=new Vector(0,0);
    this.acceleration=new Vector(0,0);
    this.force=new Vector(0,0);
    this.radius=rad;
    this.mass=m;
    this.render= function(){
        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.arc(this.location.x, this.location.y,this.radius, 0, 2*Math.PI);
        context.fill();
    };
    
    this.update= function(timeStep){
        this.acceleration.x = this.force.x / (this.mass * 600000);
        this.acceleration.y = this.force.y / (this.mass * 600000);
        
        this.force.x = this.force.y = 0;
        
        this.location.x += (this.velocity.x * timeStep) + ((this.acceleration.x * timeStep * timeStep) / 2);
		this.velocity.x += (this.acceleration.x * timeStep);
		this.location.y += (this.velocity.y * timeStep) + ((this.acceleration.y * timeStep * timeStep) / 2);
		this.velocity.y += (this.acceleration.y * timeStep);
    };
    
}

function gravity(ball1, ball2){
    //calculate gravity stuff
    "use strict";
    var diff= ball1.location.sub2(ball1.location, ball2.location);

    var distance = diff.mag();
    distance*=600000;
    
    var attraction = (6.674e-11 * ball1.mass * ball2.mass)/ (distance);
    diff.normalize();
    
    ball1.force.x +=(attraction * -diff.x);
    ball1.force.y +=(attraction * -diff.y);
    
    ball2.force.x +=(attraction * diff.x);
    ball2.force.y +=(attraction * diff.y);
}

function collision(ball1, ball2, timeStep){
    //check for collision and handle collision
    "use strict";
    var disp1 = ball1.location.add2(ball1.location.mult2(ball1.velocity,timeStep), ball1.location.mult2(ball1.acceleration, timeStep * timeStep /2.0));
    disp1.mult(-1);
    var disp2 = ball1.location.add2(ball1.location.mult2(ball2.velocity,timeStep), ball1.location.mult2(ball2.acceleration, timeStep * timeStep /2.0));
    var dispt = disp2.add2(disp1, disp2);
    var shortestLength = dispt.sub2(ball1.location, ball2.location);
    if(shortestLength.dot(dispt) <=0){
        return;
    }
    var sL = shortestLength.mag();
    if(dispt.mag() <= sL - ball1.radius -ball2.radius){
        return;
    }
    var dpUnit = new Vector(dispt.x, dispt.y);
    dpUnit.normalize();
    
    var d = dpUnit.dot(shortestLength);
    var f = (sL*sL) - (d * d);
    var radiiSquared = Math.pow(ball1.radius + ball2.radius,2);
    if (f>= radiiSquared){
        return;
    }
    
    var distance= d - Math.sqrt(radiiSquared - f);
    if(dispt.mag() < distance){
        return;
    }
    //collision!
    var collisionTime = distance/ dispt.mag();
    disp1.mult(- collisionTime * 0.9);
    disp2.mult(- collisionTime * 0.9);
    
    ball1.location.add(disp1);
    ball2.location.add(disp2);
    
    var n = ball1.location.sub2(ball1.location, ball2.location);
    n.normalize();
    
    var a1 = n.dot(ball1.velocity);
    var a2= n.dot(ball2. velocity);
    
    var optimizedP = Math.abs((2.0 * (a1 - a2))/ (ball1.mass +ball2.mass));
    
    var vA1 = dispt.add2(ball1.velocity, dispt.mult2(n, ball2.mass * optimizedP));
    var vA2 = dispt.sub2(ball2.velocity, dispt.mult2(n, ball1.mass * optimizedP));
    
    ball1.velocity= vA1;
    ball2.velocity=vA2;
    
}
//do setup stuff here
var balls = [];
var i,z;
var selected= -1;
var timeScale=1;
for(i=0;i<5;i+=1){
    balls.push(new Ball(500 + 500*Math.sin(i*Math.PI / 2.5) ,500 + 500*Math.cos(i*Math.PI / 2.5),5 *(1+i), (1+i*i) * 1e20));
}

document.onmouseup = function(){
	var v;
	var mouseX = event.clientX;
	var mouseY = event.clientY;
	for(v=0;v<balls.length;v+=1){
		if(
	}
}
//frame is basically a while loop
var frame= function(){
    "use strict";
    context.fillStyle = "#000000";
    context.fillRect(0,0,canvas.width, canvas.height);
    
    for(i=0;i<balls.length-1; i+=1){
        for(z=(i+1);z<balls.length;z+=1){
            gravity(balls[i], balls[z]);
        }
    }
    
    for(i=0;i<balls.length-1; i+=1){
        for(z=(i+1);z<balls.length;z+=1){
            collision(balls[i], balls[z], timeScale);
        }
    }
    for(i=0;i<balls.length;i+=1){
        balls[i].update(timeScale);
    }
    
    for(i=0;i<balls.length;i+=1){
        balls[i].render();
        if(i == selected){
            //ball is selected
            balls[i].render();
        }
    }
    animate(frame);
};

function select(){
    "use strict";
}

window.onload = function() {
   "use strict";
    document.body.appendChild(canvas);
    animate(frame);
};