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



var sun = new Physics.Ball(0, 0, 6.957e8, 1.989e30, r=255, g=69, b=0)
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