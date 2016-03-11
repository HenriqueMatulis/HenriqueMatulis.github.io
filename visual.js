/*jslint white: true, eqeq: true, nomen: true, vars: true*/

//set up canvas animation
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

/** 
Vector class, the functions that end in 2 accept 2 input vectors
*/
function Vector(xx, yy){
    "use strict";
    this.x=xx;
    this.y=yy;
    /**
    Add a vector to this one
    returns void
    */
    this.add=function(vector){
        this.x+=vector.x;
        this.y+=vector.y;
    };
    /**
    Add two vectors
    returns the result
    */
    this.add2=function(v1, v2){
        var v = new Vector(v1.x, v1.y);
        v.add(v2);
        return v;
    };
    
    //subtract a vector from this vector
    this.sub=function(v1){
        this.x-=v1.x;
        this.y-=v1.y;
    };
    
    //subtract second vector from first vector
    this.sub2=function(v1, v2){
        var v = new Vector(v1.x, v1.y);
        v.sub(v2);
        return v;
    };
    
    // get magnitude of this vector
    this.mag=function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };
    
    //normalize this vector
    this.normalize=function(){
        var m= this.mag();
        this.x=this.x/m;
        this.y=this.y/m;
    };
    
    //find dot product between this and another vector
    this.dot=function(vector){
        return (this.x* vector.x +this.y*vector.y);
    };
    
    //multiply this vector by a scalar
    this.mult=function(scalar){
        this.x*=scalar;
        this.y*=scalar;
    };
    
    //multiply a vector by a scalar
    this.mult2=function(v1, s){
        var v = new Vector(v1.x, v1.y);
        v.mult(s);
        return v;
    };
    
    //divide this vector by a scaler
    this.div=function(scalar){
        this.x/=scalar;
        this.y/=scalar;
    };
    
    //divide a vector by a scaler
    this.div2=function(v1, s){
        var v = new Vector(v1.x, v1.y);
        v.div(s);
        return v;
    };
    
    //rotate a vector by input angle, in radians
    this.rotate=function(angle){
        var xx=this.x;
        var yy=this.y;
        this.x = xx * Math.cos(angle) - yy * Math.sin(angle);
        this.y = yy * Math.cos(angle) + xx * Math.sin(angle);
    };
    

}

//Ball class contains data for all physics objects
function Ball(xx,yy, rad, m, hu_, sa_, br_){
    "use strict";
    this.location=new Vector(xx,yy);
    this.velocity=new Vector(0,0);
    this.acceleration=new Vector(0,0);
    //force vector is reset every frame, can't use it to accelerate an object
    this.force=new Vector(0,0);
    this.radius=rad;
    this.mass=m;
    //color
    this.hue=hu_;
    this.sat=sa_;
    this.brig=br_;
    //render the ball
    this.render= function(s, f){
        //s=scale, fx= focusx, fy=focusy
        context.fillStyle = "hsl("+this.hue+", "+this.sat+"%, "+ this.brig+"%)";
       // "hsl(0, 0%, 100%)"
        context.beginPath();
        var x_ = canvas.width/2 + (this.location.x - f.x)/s;
        var y_ = canvas.height/2 + (this.location.y - f.y)/s;
        context.arc(x_,y_,this.radius/s, 0, 2*Math.PI);
        context.fill();
    };
    
    //render the balls selected outline, and its velocity vector
    this.selected= function(s, tS, f){
        
        context.fillStyle = "rgb(0, 255, 255)";
        context.beginPath();
        var x_ = canvas.width/2 + (this.location.x - f.x)/s;
        var y_ = canvas.height/2 + (this.location.y - f.y)/s;
        context.arc(x_, y_,this.radius/s + 2, 0, 2*Math.PI);
        context.fill();
        
        //draw velocity vector
        var r = new Vector(this.velocity.x, this.velocity.y);
        r.normalize();
        r.mult(this.radius + 2);
        context.strokeStyle = "rgb(0, 255, 255)";
        context.beginPath();
        var tox = (r.x/s + x_ + this.velocity.x * tS * 60/s);
        var toy = (r.y/s + y_ + this.velocity.y * tS * 60/s);
        context.moveTo(x_, y_);
        context.lineTo(tox, toy);
        r.normalize();
        r.mult(1.2 * this.radius/s);
        r.rotate(Math.PI + Math.PI /4);
        context.lineTo(tox + r.x, toy + r.y);
        r.rotate(-Math.PI /2);
        context.moveTo(tox, toy);
        context.lineTo(tox +r.x, toy +r.y);
        context.stroke();
        
    };
    
    //update the balls location
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

//calculate and apply the gravitational attraction between 2 physics objects
function gravity(ball1, ball2){
    "use strict";
    //vector points from 2 to 1
    var diff= ball1.location.sub2(ball1.location, ball2.location);
    var distance = diff.mag();
    //calculate gravitations attraction, use diff for direction
    var attraction = (6.674e-11 * ball1.mass * ball2.mass)/ (distance * distance);
    diff.normalize();
    
    //apply forces
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

var balls = []; //array of all physics objects, behaves liek arraylist

var i,z, s; //variables for for loops

var selected= -1; //the ball that is currently selected, -1 if none

var timeScale=10; //amount of seconds one cycle represents
var timeSteps=50; //amount of cycles per frame of animation

var scale = 600000; //1px: scale meters
var shift = new Vector(canvas.width/2 * scale, canvas.height/2 * scale); //point where the screen is centered around

//mouse stuff
var drag = -2; //what is being dragged currently (-1 is bg, -2 is nothing, 0 and above are balls)
var dragFoc = new Vector(0,0); //drag focus (where the dragging started)
var dragClient = new Vector(0,0);
var mouseLoc = new Vector(0,0);

//create ball function radius relative to screen
var createRadius=20;

balls.push(new Ball(scale * canvas.width/2 ,scale * canvas.height/2,scale * 63, 1e24,0,0,100));
balls.push(new Ball(scale * 900 ,scale * 500,scale * 14, 1e20,0,0,100));
balls[1].velocity.y = 471.66372201672100474412475024634;
balls.push(new Ball(scale * 950 ,scale * 500,scale * 5, 1, 0,0,100));

function setup(){
    "use strict";
    selected= -1; //the ball that is currently selected, -1 if none
    
    timeScale=10; //amount of seconds one cycle represents
    timeSteps=50; //amount of cycles per frame of animation

    scale = 600000; //1px: scale meters
    shift = new Vector(canvas.width/2 * scale, canvas.height/2 * scale); //point where the screen is centered around

    //mouse stuff
    drag = -2; //what is being dragged currently (-1 is bg, -2 is nothing, 0 and above are balls)
    dragFoc = new Vector(0,0); //drag focus (where the dragging started)
    dragClient = new Vector(0,0);
    mouseLoc = new Vector(0,0);
    
    balls=[];
    balls.push(new Ball(scale * canvas.width/2 ,scale * canvas.height/2,scale * 63, 1e24,0,0,100));
    balls.push(new Ball(scale * 900 ,scale * 500,scale * 14, 1e20,0,0,100));
    balls[1].velocity.y = 471.66372201672100474412475024634;
    balls.push(new Ball(scale * 950 ,scale * 500,scale * 5, 1, 0,0,100));
}

function deleteAll(){
    "use strict";
    balls=[];
}


//refresh a specific textbox
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

//refresh all textboxes that could change on one frame
function refreshAll(){
    
    "use strict";
    if(document.activeElement.id !='scale'){
        document.getElementById('scale').value = scale.toExponential();
    }
    if(selected==-1){
        return;
    }
    
    if(document.activeElement.id != 'x'){
        document.getElementById('x').value = balls[selected].location.x.toExponential();
    }
    if(document.activeElement.id !='y'){
        document.getElementById('y').value = balls[selected].location.y.toExponential();
    }
    if(document.activeElement.id !='vx'){
        document.getElementById('vx').value = balls[selected].velocity.x.toExponential();
    }
    if(document.activeElement.id !='vy'){
        document.getElementById('vy').value = balls[selected].velocity.y.toExponential();
    }
    
    
}



//convert user's relative co-ordinate system to the absolute cordinate system
function convertToAbs(loc){
    "use strict";
    var l = new Vector((loc.x - canvas.width/2)*scale, (loc.y - canvas.height/2)*scale);
    l.add(shift);
    return l;
}
//find ball that overlaps given co-ordinate, pass in mouse co-ordinates in vector form
function findBall(loc, give){
    "use strict";
    
    //check if point is over a ball
    var v;
	for(v=0;v<balls.length;v+=1){
		if(Math.sqrt((loc.x - balls[v].location.x) * (loc.x - balls[v].location.x) + (loc.y - balls[v].location.y) * (loc.y - balls[v].location.y)) < balls[v].radius + give){
            return v;
        }
    }
    
    return -1; //no ball
}

function getClickStyle(){
    "use strict";
    var clickR = document.getElementsByName("click");
    var v=0;
    for(v = 0; v < clickR.length; v+=1) {
        if(clickR[v].checked == true) {
            return clickR[v].value;
        }
    }
}

//handles selecting balls
document.onmousedown = function(event){
    "use strict";   
    //check if mouse is within canvas
    if(event.clientX > canvas.width){
        return;
    }
    
    //check if user clicked a ball
    var mouse = new Vector(event.clientX, event.clientY); 
    mouse = convertToAbs(mouse);
    
    var clicked = findBall(mouse, 20 * scale);
    //find what function clicking is set to
    var clickR = getClickStyle();
     
    if(clicked >= 0){
        if(clickR == 'drag'){
                drag=clicked;
                return;
        }
        
        if(clickR == 'select'){
            if(selected === clicked){
                selected = -1;
                document.getElementById('mass').disabled =document.getElementById('radius').disabled= document.getElementById('x').disabled = document.getElementById('y').disabled = document.getElementById('vx').disabled =  document.getElementById('vy').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
                return;          
            }
        
            selected = clicked;
            document.getElementById('mass').disabled =document.getElementById('radius').disabled= document.getElementById('x').disabled = document.getElementById('y').disabled = document.getElementById('vx').disabled =  document.getElementById('vy').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = false;
            refresh('mass');
            refresh('radius');
            refresh('x');
            refresh('y');
            refresh('vx');
            refresh('vy');
            return;
        }
        
        if(clickR == 'delete'){
            balls.splice(clicked, 1);
            return;
        }
        
        if(clickR == 'orbit' && clicked != selected){
            //make vector that points from selected to clicked
            var difference = balls[clicked].location.sub2(balls[clicked].location, balls[selected].location);
            
            //find orbital speed at given distance (circular)
            var speed = Math.sqrt(6.67384e-11 * balls[clicked].mass / difference.mag());
            

            //translate speed into vector
            difference.normalize();
            difference.rotate(Math.PI/2);
            difference.mult(speed);

            //update selected's velocity
            balls[selected].velocity = difference;
            return;
        }
    }
    
    if(clickR == 'create'){
        balls.push(new Ball(mouse.x , mouse.y, scale * createRadius, 1,0,0,100));
        return;
    }
    
    if(clickR == 'copy'){
        balls.push(new Ball(mouse.x , mouse.y, balls[selected].radius, balls[selected].mass, balls[selected].hue, balls[selected].sat, balls[selected].brig));
        return;
    }
    
    
    //the user did not select anything; wants to move camera around
    dragClient = new Vector(event.clientX, event.clientY);
    dragFoc = new Vector(shift.x, shift.y);
    drag = -1;
};

document.onmouseup = function(event){
    "use strict";
    drag = -2;
    
};

//mousewheel changes scale of simulation, and the focuspoint
var zoom = function(evt){
    "use strict";
    
    //from http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
    if (!evt){ evt = event;}
    var delta = (evt.detail<0 || evt.wheelDelta>0) ? 1 : -1;
    
    if(getClickStyle() == 'create'){
        createRadius+=createRadius+delta<=0?0:delta;
       return;
    }
    scale = scale * Math.pow(1.0717734625362931642130063250233,-delta);
};

canvas.addEventListener('DOMMouseScroll',zoom,false); // for Firefox
canvas.addEventListener('mousewheel',    zoom,false); // for everyone else

var mouseUpdate = function(e){
    "use strict";
    //update mouse location
    mouseLoc.x = e.clientX;
    mouseLoc.y = e.clientY;
    
    if(drag == -1){
        var mouse = new Vector((dragClient.x -e.clientX)*scale, (dragClient.y -e.clientY)*scale);
        mouse.add(dragFoc);
        shift=mouse;
    }else if(drag >=0){
        balls[drag].location = convertToAbs(new Vector(e.clientX, e.clientY));
    }
};
document.addEventListener('mousemove', mouseUpdate, false);
//handles user input through textboxes, runs on enter
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

//frame is basically a while loop or draw loop
var frame= function(){
    "use strict";
    for(s=0;s<timeSteps;s+=1){
        //calculate gravitational attractions
        for(i=0;i<balls.length-1; i+=1){
            for(z=(i+1);z<balls.length;z+=1){
                gravity(balls[i], balls[z]);
            }
        }
        
        //check for collision between all balls
        for(i=0;i<balls.length-1; i+=1){
            for(z=(i+1);z<balls.length;z+=1){
                collision(balls[i], balls[z], timeScale);
            }
        }
        //calculate the new values for all balls
        for(i=0;i<balls.length;i+=1){
            balls[i].update(timeScale);
        }
    }
    
    //refresh the info panel
    refreshAll();
    
    //Resets canvas
    context.fillStyle = "rgba(0,0,0,"+(document.getElementById('trace').value==0?1:(1.0/(document.getElementById('trace').value *60))) +")";
    context.fillRect(0,0,canvas.width, canvas.height);
    
    
    
    
    //find current mouse function
    var clickR = getClickStyle();
    
    if(clickR == 'create'){
         context.fillStyle = "rgb(0, 255, 255)";
        context.beginPath();
        
        context.arc(mouseLoc.x, mouseLoc.y, createRadius+2, 0, 2*Math.PI);
        context.fill();
              
        context.fillStyle = "rgb(0, 0, 0)";
        context.beginPath();
                
        context.arc(mouseLoc.x, mouseLoc.y, createRadius, 0, 2*Math.PI);
        context.fill();
                
        }else if(clickR == 'delete'){
                
        }else if(clickR == 'copy'){
            context.fillStyle = "rgb(0, 255, 255)";
            context.beginPath();
                
            context.arc(mouseLoc.x, mouseLoc.y, balls[selected].radius/scale +2, 0, 2*Math.PI);
            context.fill();
                
            context.fillStyle = "rgb(0, 0, 0)";
            context.beginPath();
                
            context.arc(mouseLoc.x, mouseLoc.y, balls[selected].radius/scale, 0, 2*Math.PI);
            context.fill();
                
        }else if(clickR == 'orbit'){
            var mouseOver = findBall(convertToAbs(new Vector(mouseLoc.x, mouseLoc.y)), 20*scale);
            if(mouseOver >=0 && mouseOver != selected){
                var diff = balls[selected].location.sub2(balls[mouseOver].location, balls[selected].location);
                 diff = diff.mag() / scale;
                    
                var x_ = canvas.width/2 + (balls[mouseOver].location.x - shift.x)/scale;
                var y_ = canvas.height/2 + (balls[mouseOver].location.y - shift.y)/scale;
                    
                context.fillStyle = "rgb(0, 255, 255)";
                context.beginPath();
            
                context.arc(x_, y_, diff +2, 0, 2*Math.PI);
                context.fill();
            
                context.fillStyle = "rgb(0, 0, 0)";
                context.beginPath();
                
                context.arc(x_, y_, diff, 0, 2*Math.PI);
                context.fill();
            }
        }

    
    //draws the selection outline
    if(selected!=-1){
        balls[selected].selected(scale, timeScale * timeSteps, shift);
    }
    
    //render all balls
    for(i=0;i<balls.length;i+=1){
        balls[i].render(scale, shift);
    }
    
    animate(frame);
};



window.onload = function() {
   "use strict";
    document.body.appendChild(canvas);
    animate(frame);
};