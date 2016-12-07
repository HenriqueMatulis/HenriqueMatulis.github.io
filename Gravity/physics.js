//Ball class contains data for all physics objects
function Ball(xx, yy, rad, m) {
    "use strict";
    this.location = new Vector(xx, yy);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    //force vector is reset every frame, can't use it to accelerate an object
    this.force = new Vector(0, 0);
    this.radius = rad;
    this.mass = m;
    
    
    
    
    //update the balls location
    this.update= function(timeScale){
        this.acceleration.x = this.force.x / (this.mass);
        this.acceleration.y = this.force.y / (this.mass);
        
        this.force.x = this.force.y = 0;
        
        this.location.x += (this.velocity.x * timeScale) + ((this.acceleration.x * timeScale * timeScale) / 2);
		this.velocity.x += (this.acceleration.x * timeScale);
		this.location.y += (this.velocity.y * timeScale) + ((this.acceleration.y * timeScale * timeScale) / 2);
		this.velocity.y += (this.acceleration.y * timeScale);
    };
    
}


//calculate and apply the gravitational attraction between 2 physics objects
function gravity(ball1, ball2){
    "use strict";
    //vector points from 2 to 1
    var diff = ball1.location.sub2(ball1.location, ball2.location);
    //calculate gravitations attraction, use diff for direction
    var attraction = (6.674e-11 * ball1.mass * ball2.mass)/ (diff.magSq());
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
