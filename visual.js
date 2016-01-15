/*jslint white: true, eqeq: true, nomen: true, vars: true*/
var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {
    "use strict";
    window.setTimeout(callback, 1000/60); 
  };

var canvas= document.getElementById("myCanvas");
canvas.width= window.innerWidth * 0.85;
canvas.height=window.innerHeight ;
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
    this.r=0;
    this.g=0;
    this.b=0;
    this.render= function(s){
        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.arc(this.location.x/s, this.location.y/s,this.radius/s, 0, 2*Math.PI);
        context.fill();
    };
    this.selected= function(s, tS){
        context.fillStyle = "rgb(0, 255, 255)";
        context.beginPath();
        context.arc(this.location.x/s, this.location.y/s,this.radius/s + 2, 0, 2*Math.PI);
        context.fill();
        
        //draw velocity vector
        var r = new Vector(this.velocity.x, this.velocity.y);
        r.normalize();
        r.mult(this.radius + 2);
        context.strokeStyle = "rgb(0, 255, 255)";
        context.beginPath();
        context.moveTo(this.location.x / s, this.location.y / s);
        context.lineTo((r.x + this.location.x + this.velocity.x * tS * 60)/s, (r.y + this.location.y + this.velocity.y * tS * 60)/s);
        context.stroke();
        
    };
    
    this.update= function(tS){
        this.acceleration.x = this.force.x / (this.mass);
        this.acceleration.y = this.force.y / (this.mass);
        
        this.force.x = this.force.y = 0;
        
        this.location.x += (this.velocity.x * tS) + ((this.acceleration.x * tS * tS) / 2);
		this.velocity.x += (this.acceleration.x * tS);
		this.location.y += (this.velocity.y * tS) + ((this.acceleration.y * tS * tS) / 2);
		this.velocity.y += (this.acceleration.y * tS);
    };
    
}

function gravity(ball1, ball2){
    //calculate gravity stuff
    "use strict";
    var diff= ball1.location.sub2(ball1.location, ball2.location);

    var distance = diff.mag();
   // distance*=600000; values already in meters if using scale
    
    var attraction = (6.674e-11 * ball1.mass * ball2.mass)/ (distance * distance);
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
var i,z, s;
var selected= -1;
var timeScale=10;
var timeSteps=50;
var scale = 600000;
balls.push(new Ball(scale * 500 ,scale * 500,scale * 63, 1e24));
balls.push(new Ball(scale * 900 ,scale * 500,scale * 14, 1e20));
balls[1].velocity.y = 471.66372201672100474412475024634;
balls.push(new Ball(scale * 950 ,scale * 500,scale * 5, 1));
//balls[2].velocity.x = 14.915316512453454021963870146151;
//balls[2].velocity.y = 490.91931283543591058403099911566;

function refresh(id){
    "use strict";
    
    if(id == 'mass'){
        document.getElementById('mass').value = balls[selected].mass.toExponential();
    }else if(id == 'radius'){
        document.getElementById('radius').value = balls[selected].radius.toExponential();
    }else if(id == 'x'){
        document.getElementById('x').value = balls[selected].location.x.toExponential();
    }else if(id == 'y'){
        document.getElementById('y').value = balls[selected].location.y.toExponential();
    }else if(id == 'vx'){
        document.getElementById('vx').value = balls[selected].velocity.x.toExponential();
    }else if(id == 'vy'){
        document.getElementById('vy').value = balls[selected].velocity.y.toExponential();
    }else if(id =='timescale'){
        document.getElementById(id).value = timeScale;
    }else if(id =='steps'){
        document.getElementById(id).value = timeSteps;
    }else if(id =='scale'){
        document.getElementById(id).value = scale.toExponential();
    }
}
document.onmouseup = function(event){
    "use strict";
    var v;
	for(v=0;v<balls.length;v+=1){
		if(Math.sqrt((event.clientX - balls[v].location.x/scale) * (event.clientX - balls[v].location.x/scale) + (event.clientY - balls[v].location.y/scale) * (event.clientY - balls[v].location.y/scale)) < balls[v].radius/scale + 2){
            if(selected === v){
                selected = -1;
                document.getElementById('mass').disabled =document.getElementById('radius').disabled= document.getElementById('x').disabled = document.getElementById('y').disabled = document.getElementById('vx').disabled = document.getElementById('vy').disabled = true;
                
            }else{
                selected = v;
                document.getElementById('mass').disabled =document.getElementById('radius').disabled= document.getElementById('x').disabled = document.getElementById('y').disabled = document.getElementById('vx').disabled = document.getElementById('vy').disabled = false;
                refresh('mass');
                refresh('radius');
                refresh('x');
                refresh('y');
                refresh('vx');
                refresh('vy');
            }
            break;
        }
	}
};

function uInput(id){
    "use strict";
    if(id == "timescale"){
        timeScale=parseFloat(document.getElementById(id).value);
    }else if(id =="steps"){
        timeSteps=parseFloat(document.getElementById(id).value);
    }else if(id =="scale"){
        scale=parseFloat(document.getElementById(id).value);
    }else if(id =="mass"){
        balls[selected].mass=parseFloat(document.getElementById(id).value);
    }else if(id =="radius"){
        balls[selected].radius=parseFloat(document.getElementById(id).value);
    }else if(id =="x"){
        balls[selected].location.x=parseFloat(document.getElementById(id).value);
    }else if(id =="y"){
        balls[selected].location.y=parseFloat(document.getElementById(id).value);
    }else if(id =="vx"){
        balls[selected].velocity.x=parseFloat(document.getElementById(id).value);
    }else if(id =="vy"){
        balls[selected].velocity.y=parseFloat(document.getElementById(id).value);
    }
}

//frame is basically a while loop
var frame= function(){
    "use strict";
    for(s=0;s<timeSteps;s+=1){
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
    }
    context.fillStyle = "#000000";
    context.fillRect(0,0,canvas.width, canvas.height);
    if(selected!=-1){
        balls[selected].selected(scale, timeScale * timeSteps);
    }
    for(i=0;i<balls.length;i+=1){
        balls[i].render(scale);
    }
    
    animate(frame);
};



window.onload = function() {
   "use strict";
    document.body.appendChild(canvas);
    animate(frame);
};