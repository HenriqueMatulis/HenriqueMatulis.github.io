Physics = (function(){

//Ball class contains data for all physics objects
BALL = function Ball(x, y, radius, mass, r = 255, g = 255, b = 255) {
    this.location = new Vector(x, y);
    this.locationHistory = new Array(timeStep+1).fill(0).map(() => new Vector(x, y));
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    //force vector is reset every frame, can't use it to accelerate an object
    this.force = new Vector(0, 0);
    this.radius = radius;
    this.mass = mass;
    this.red = r
    this.green = g
    this.blue = b
    
    
    
    
    //update the balls location
    this.update= function(timeScale, step){
        this.locationHistory[step].copy(this.location);

        this.acceleration.x = this.force.x / this.mass;
        this.acceleration.y = this.force.y / this.mass;
        
        this.force.x = this.force.y = 0;
        
        this.location.x += (this.velocity.x + this.acceleration.x * timeScale / 2) * timeScale;
        this.location.y += (this.velocity.y + this.acceleration.y * timeScale / 2) * timeScale;
        
        this.velocity.x += this.acceleration.x * timeScale;
        this.velocity.y += this.acceleration.y * timeScale;
        this.locationHistory[step+1].copy(this.location);
    };
    
}

BALLS = [];

diff = new Vector();
attraction = 0;
//calculate and apply the gravitational attraction between 2 physics objects
GRAVITY = function gravity(ball1, ball2){
    "use strict";
    //vector points from 2 to 1
    diff.x = ball1.location.x - ball2.location.x;
    diff.y = ball1.location.y - ball2.location.y;
    //calculate gravitations attraction, use diff for direction
    attraction = (6.674e-11 * ball1.mass * ball2.mass)/ (diff.magSq());
    diff.normalize();
    
    diff.mult(attraction);
    
    //apply forces
    ball1.force.sub(diff);
    // ball2.force.add(diff);
}


disp1 = new Vector();
disp2 = new Vector();
dispt = new Vector();
shortestLength = new Vector();
sL = 0;
dpUnit = new Vector();
d = 0;
f = 0;
radiiSquared = 0;
distance = 0;
collisionTime = 0;
n = new Vector();
a1 = 0;
a2 = 0;
optimizedP = 0;
vA1 = new Vector();
vA2 = new Vector();

COLLISION = function collision(ball1, ball2, timeStep){
    //check for collision and handle collision
    "use strict";
    
    //find the displacement of balls 1 and 2
    disp1.x = -(ball1.velocity.x + ball1.acceleration.x * timeStep / 2.0) * timeStep;
    disp1.y = -(ball1.velocity.y + ball1.acceleration.y * timeStep / 2.0) * timeStep;
    
    disp2.x = (ball2.velocity.x + ball2.acceleration.x * timeStep / 2.0) * timeStep;
    disp2.y = (ball2.velocity.y + ball2.acceleration.y * timeStep / 2.0) * timeStep;
    
    
    // relative displacement
    dispt.x = disp1.x + disp2.x;
    dispt.y = disp1.y + disp2.y;
    
    //equivalent to
    /**
    disp1 = VECTOR.add(VECTOR.mult(ball1.velocity,timeStep), VECTOR.mult(ball1.acceleration, timeStep * timeStep / 2.0));
    disp1.mult(-1);
    disp2 = VECTOR.add(VECTOR.mult(ball2.velocity, timeStep), VECTOR.mult(ball2.acceleration, timeStep * timeStep /2.0));
    
    dispt = VECTOR.add(disp1, disp2);
    **/
    
    
    
    
    
    //var shortestLength = VECTOR.sub(ball1.location, ball2.location);
    //[shortestLength.dot(dispt) <= 0] <= equivalent to the statment below
    shortestLength.x = ball1.location.x - ball2.location.x;
    shortestLength.y = ball1.location.y -  ball2.location.y;
    if(shortestLength.dot(dispt) <= 0){
        return false;
    }
    
    sL = shortestLength.mag();
    if(dispt.mag() <= sL - ball1.radius - ball2.radius){
        return false;
    }
    
    dpUnit.x = dispt.x;
    dpUnit.y = dispt.y;
    dpUnit.normalize();
    
    d = (ball1.location.x - ball2.location.x) * dpUnit.x + (ball1.location.y - ball2.location.y) * dpUnit.y; //dpUnit.dot(shortestLength);
    f = (sL*sL) - (d * d);
    radiiSquared = Math.pow(ball1.radius + ball2.radius,2);
    if (f>= radiiSquared){
        return false;
    }
    
    distance= d - Math.sqrt(radiiSquared - f);
    if(dispt.mag() < distance){
        return false;
    }
    //collision!
    collisionTime = distance/ dispt.mag();
    disp1.mult(-collisionTime);
    disp2.mult(-collisionTime);
    
    ball1.location.add(disp1);
    // ball2.location.add(disp2);
    
    n = VECTOR.sub(ball1.location, ball2.location);
    n.x = ball1.location.x - ball2.location.x;
    n.y = ball1.location.y - ball2.location.y;
    n.normalize();
    
    a1 = n.dot(ball1.velocity);
    a2= n.dot(ball2.velocity);
    
    optimizedP = Math.abs((2.0 * (a1 - a2))/ (ball1.mass + ball2.mass));
    
    
    
    vA1 = VECTOR.add(ball1.velocity, VECTOR.mult(n, ball2.mass * optimizedP));
    vA2 = VECTOR.sub(ball2.velocity, VECTOR.mult(n, ball1.mass * optimizedP));
    
    ball1.velocity = vA1;
    // ball2.velocity = vA2;
    
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

var LAST_STEP = timeStep;
INIT_LOCATION_HISTORY = function initHistory(steps){
    if (steps === LAST_STEP){
        return;
    }
    for(i = 0; i < BALLS.length; i += 1){
        BALLS[i].locationHistory = new Array(steps+1).fill(0).map(() => new Vector());
    }
    LAST_STEP = steps;
};

UPDATE = function update(timeScale, step){
    var i;
    for(i = 0; i < BALLS.length; i += 1){
        var j;
        for(j = 0 ; j < Math.min(BALLS.length, 10); j += 1){
            if (i != j){
                GRAVITY(BALLS[i], BALLS[j]);
                COLLISION(BALLS[i], BALLS[j], timeScale);
            }
        }
        BALLS[i].update(timeScale, step);
    }
}


var PAUSE = false;

var SETPAUSE = function setPause(newPause){
    PAUSE = newPause;
}   


var TOGGLEPAUSE = function togglePause(){
    PAUSE = !PAUSE;
}   

var GETPAUSE = function getPause(){
    return PAUSE;
} 

RUN = function run(timeScale, timeStep){
    if(PAUSE){
        return;
    }

    INIT_LOCATION_HISTORY(timeStep);
    var i;
    for(i = 0; i < timeStep; i += 1){
        UPDATE(timeScale, i);
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
    pause: GETPAUSE,
    togglePause: TOGGLEPAUSE
};
}());