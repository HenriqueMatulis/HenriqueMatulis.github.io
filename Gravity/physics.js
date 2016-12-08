Physics = (function(){

//Ball class contains data for all physics objects
BALL = function Ball(x, y, radius, mass) {
    "use strict";
    this.location = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    //force vector is reset every frame, can't use it to accelerate an object
    this.force = new Vector(0, 0);
    this.radius = radius;
    this.mass = mass;
    
    
    
    
    //update the balls location
    this.update= function(timeScale){
        this.acceleration = VECTOR.div(this.force, (this.mass));
        
        this.force.x = this.force.y = 0;
        
        this.location.add(VECTOR.mult(this.velocity, timeScale));
        this.location.add(VECTOR.mult(this.acceleration, timeScale * timeScale / 2));
        
        this.velocity.add(VECTOR.mult(this.acceleration, timeScale))
    };
    
}


//calculate and apply the gravitational attraction between 2 physics objects
GRAVITY = function gravity(ball1, ball2){
    "use strict";
    //vector points from 2 to 1
    var diff = VECTOR.sub(ball1.location, ball2.location);
    //calculate gravitations attraction, use diff for direction
    var attraction = (6.674e-11 * ball1.mass * ball2.mass)/ (diff.magSq());
    diff.normalize();
    
    diff.mult(attraction);
    
    //apply forces
    ball1.force.sub(diff);
    ball2.force.add(diff);
}

COLLISION = function collision(ball1, ball2, timeStep){
    //check for collision and handle collision
    "use strict";
    
    //find the displacement of balls 1 and 2
    var disp1 = VECTOR.add(VECTOR.mult(ball1.velocity,timeStep), VECTOR.mult(ball1.acceleration, timeStep * timeStep / 2.0));
    disp1.mult(-1);
    var disp2 = VECTOR.add(VECTOR.mult(ball2.velocity, timeStep), VECTOR.mult(ball2.acceleration, timeStep * timeStep /2.0));
    
    // relative displacement
    var dispt = VECTOR.add(disp1, disp2);
    
    
    var shortestLength = VECTOR.sub(ball1.location, ball2.location);
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
    disp1.mult(-collisionTime);
    disp2.mult(-collisionTime);
    
    ball1.location.add(disp1);
    ball2.location.add(disp2);
    
    var n = VECTOR.sub(ball1.location, ball2.location);
    n.normalize();
    
    var a1 = n.dot(ball1.velocity);
    var a2= n.dot(ball2. velocity);
    
    var optimizedP = Math.abs((2.0 * (a1 - a2))/ (ball1.mass +ball2.mass));
    
    var vA1 = VECTOR.add(ball1.velocity, VECTOR.mult(n, ball2.mass * optimizedP));
    var vA2 = VECTOR.sub(ball2.velocity, VECTOR.mult(n, ball1.mass * optimizedP));
    
    ball1.velocity= vA1;
    ball2.velocity=vA2;
    
}

return {
    Ball: BALL,
    gravity: GRAVITY,
    collision: COLLISION
};
}());