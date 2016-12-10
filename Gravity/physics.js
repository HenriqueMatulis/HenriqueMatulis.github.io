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

BALLS = [];

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
        return false;
    }
    var sL = shortestLength.mag();
    if(dispt.mag() <= sL - ball1.radius -ball2.radius){
        return false;
    }
    var dpUnit = new Vector(dispt.x, dispt.y);
    dpUnit.normalize();
    
    var d = dpUnit.dot(shortestLength);
    var f = (sL*sL) - (d * d);
    var radiiSquared = Math.pow(ball1.radius + ball2.radius,2);
    if (f>= radiiSquared){
        return false;
    }
    
    var distance= d - Math.sqrt(radiiSquared - f);
    if(dispt.mag() < distance){
        return false;
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
    
    ball1.velocity = vA1;
    ball2.velocity = vA2;
    
    return true;
    
}
/** Return the id of the ball closest to the Vector location that is within give units of it,
** return -1 if there is none
**/
FINDBALL = function findBall(loc, give){
    "use strict";
    var i, minId=-1;
	for(i=0; i<BALLS.length; i += 1){
        var delta = VECTOR.sub(BALLS[i].location, loc).mag();
        var r = BALLS[i].radius;
        
		if(delta < r){
            return i;
        }
        
        if(delta - r < give){
            give = delta - r;
            minId = i;
        }
    }
    
    return minId; 
}

//find balls in given rectangle
FINDBALLRECT = function findBallsInRect(corner1, corner2){
    "use strict";
    var temp;
    
    if(corner1.x > corner2.x){
        temp = corner2.x;
        corner2.x=corner1.x;
        corner1.x=temp;
    }
    
    if(corner1.y > corner2.y){
        temp = corner2.y;
        corner2.y=corner1.y;
        corner1.y=temp;
    }
    
    
    var i, ids=[];
    for(i=0; i<BALLS.length; i+=1){
        if(corner1.x > BALLS[i].location.x){
            continue;
        }
        if(corner2.x < BALLS[i].location.x){
            continue;
        }
        if(corner1.y > BALLS[i].location.y){
            continue;
        }
        if(corner2.y < BALLS[i].location.y){
            continue;
        }
        
        ids.push(i);
        
    }
    return ids;
    
}

UPDATE = function update(timeScale){
    var i;
    for(i = 0; i < BALLS.length; i += 1){
        var j;
        for(j = i + 1 ; j < BALLS.length; j += 1){
            GRAVITY(BALLS[i], BALLS[j]);
            COLLISION(BALLS[i], BALLS[j], timeScale);
        }
        BALLS[i].update(timeScale);
    }
}


var PAUSE = false;

var SETPAUSE = function setPause(newPause){
    PAUSE = newPause;
}   


var TOGGLEPAUSE = function togglePause(){
    PAUSE = !PAUSE;
}   

RUN = function run(timeScale, timeStep){
    if(PAUSE){
        return;
    }
    var i;
    for(i = 0; i < timeStep; i += 1){
        UPDATE(timeScale);
    }
}

return {
    Ball: BALL,
    Balls:BALLS,
    gravity: GRAVITY,
    collision: COLLISION,
    findBall: FINDBALL,
    findBallInRect: FINDBALLRECT,
    update: UPDATE,
    run: RUN,
    setPause: SETPAUSE,
    togglePause: TOGGLEPAUSE
};
}());