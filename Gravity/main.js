Physics.Balls.length = 0;
            


var mercury = new Physics.Ball(0, 57.9e9, 2.4395e6, 33011e23);
mercury.velocity.x = 47.4e3;
Physics.Balls.push(mercury);

var venus = new Physics.Ball(0, 108.2e9, 6.052e6, 4.87e24, r=255, g=180, b=120);
venus.velocity.x = 35e3;
Physics.Balls.push(venus);

var earth = new Physics.Ball(0, 149.6e9, 6.371e6, 5.972e24, r=0, g=255, b=0);
earth.velocity.x = 30e3;
Physics.Balls.push(earth);
            
var moon = new Physics.Ball(3.844e8, 149.6e9, 1.737e6, 7.34767309e22);
moon.velocity.x = earth.velocity.x;
moon.velocity.y = 1.023e3;
Physics.Balls.push(moon);


var mars = new Physics.Ball(0, 227.9e9, 3.396e6, 0.642e24, r=255, g=0, b=0);
mars.velocity.x = 24.1e3;
Physics.Balls.push(mars);


var jupiter = new Physics.Ball(0, 778.6e9, 71.492e6, 1898e24, r=200, g=147, b=77);
jupiter.velocity.x = 13.1e3;
Physics.Balls.push(jupiter);



var saturn = new Physics.Ball(0, 1433.5e9, 60.268e6, 568e24, r=200, g=147, b=77);
saturn.velocity.x = 9.7e3;
Physics.Balls.push(saturn);



var uranus = new Physics.Ball(0, 2872.5e9, 25.559e6, 86.8e24, r=202, g=240, b=241);
uranus.velocity.x = 6.8e3;
Physics.Balls.push(uranus);



var neptune = new Physics.Ball(0, 4495.1e9, 24.764e6, 102e24, r=72, g=114, b=255);
neptune.velocity.x = 5.4e3;
Physics.Balls.push(neptune);



var sun = new Physics.Ball(0, 0, 6.957e8, 1.989e30, r=255, g=255, b=140)
Physics.Balls.push(sun);
        

Visual.setScale(3.844e8);
// Visual.setCamera(1)
window.setTimeout(refreshAll, 1000/15); 
        
var f = function f(){
  
    Physics.run(timeScale, timeStep);
    
    Visual.render(Physics.Balls, timeScale * timeStep);
    inputLoop();
    animate(f);
}
        
// animate(f);