Physics.Balls.length = 0;
            
var earth = new Physics.Ball(0, 0, 6.371e6, 5.972e24);
Physics.Balls.push(earth);
            
var moon = new Physics.Ball(3.844e8, 0, 1.737e6, 7.34767309e22);
moon.velocity.y =1.023e3;
Physics.Balls.push(moon);
        

Visual.setScale(1.2e6);
window.setTimeout(refreshAll, 1000/60); 
        
var f = function f(){
  
    Physics.run(timeScale, timeStep);
    
    Visual.render(Physics.Balls, timeScale * timeStep);
    inputLoop();
    animate(f);
}
        
animate(f);