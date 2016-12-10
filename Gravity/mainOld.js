/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxlen: 120, maxerr: 50*/

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



//do setup stuff here

var balls = []; //array of all physics objects, behaves liek arraylist


var selected= []; //array of ids of balls currently being selected
var selecting = false;

var timeScale=50; //amount of seconds one cycle represents
var timeSteps=100; //amount of cycles per frame of animation

//camera stuff
var scale = 600000; //1px: scale meters
var shift = new Vector(canvas.width/2 * scale, canvas.height/2 * scale); //point where the screen is centered around
var cameraLock = -1; //id for ball camera is locked on to 

//mouse stuff
var drag = -1; //what is being dragged currently (-2 is bg, -1 is nothing, 0 and above are balls)
var dragFoc = new Vector(0,0); //drag focus (where the dragging started)
var selectStart;
var dragClient = new Vector(0,0);
var mouseLoc = new Vector(0,0);

//create ball function radius relative to screen
var createRadius=20;

var mvUp=false, mvDown=false, mvLeft=false, mvRight=false;

var templateString = '[{"location":{"x":390340647.7106449,"y":219658576.7183134},"velocity":{"x":-0.06854915785755715,"y":0.018033897792559872},"acceleration":{"x":1.4462703192670295e-26,"y":-2.0026159600984145e-27},"force":{"x":0,"y":0},"radius":37800000,"mass":1e+24},{"location":{"x":481653879.44891775,"y":220148954.0745718},"velocity":{"x":5.318577745604819,"y":-854.8455725764729},"acceleration":{"x":-0.008003855280679161,"y":-0.00004672961549658137},"force":{"x":0,"y":0},"radius":3133982.0278660464,"mass":1},{"location":{"x":510570770.2650439,"y":231556220.38363212},"velocity":{"x":-72.92044079048155,"y":739.7755054360014},"acceleration":{"x":-0.004550139505824731,"y":-0.00044885593008022774},"force":{"x":0,"y":0},"radius":5745633.717754418,"mass":1},{"location":{"x":531032339.8306113,"y":171463962.71022034},"velocity":{"x":217.1847186697145,"y":633.7948611748192},"acceleration":{"x":-0.0028545364043755994,"y":0.0009785536356587314},"force":{"x":0,"y":0},"radius":7573789.900676278,"mass":1},{"location":{"x":288281906.005353,"y":55737937.33983264},"velocity":{"x":-499.1956614852389,"y":310.7376967104933},"acceleration":{"x":0.0009458279982091978,"y":0.0015196478700164923},"force":{"x":0,"y":0},"radius":8879615.745620465,"mass":1}]';
var templateArray = JSON.parse(templateString);

var ii, bb;
for(ii=0;ii<templateArray.length;ii++){
        bb = new Ball(templateArray[ii].location.x, templateArray[ii].location.y, templateArray[ii].radius, templateArray[ii].mass);
        bb.velocity = templateArray[ii].velocity;
        balls.push(bb);
}



function deleteAll(){
    "use strict";
    selected= [];
    cameraLock=-1;
    balls=[];
    document.getElementById('mass').disabled = document.getElementById('massSet').disabled = document.getElementById('radius').disabled = document.getElementById('radiusSet').disabled = document.getElementById('x').disabled = document.getElementById('xSet').disabled = document.getElementById('y').disabled = document.getElementById('ySet').disabled = document.getElementById('vx').disabled = document.getElementById('vxSet').disabled = document.getElementById('vy').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
    //Resets canvas
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0,0,canvas.width, canvas.height);
}



function setup(){
    "use strict";
    
    //Resets canvas
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0,0,canvas.width, canvas.height);
    
    selecting = false;
    
    timeScale=50; //amount of seconds one cycle represents
    timeSteps=10; //amount of cycles per frame of animation
    
    //camera stuff
    scale = 600000; //1px: scale meters
    shift = new Vector(canvas.width/2 * scale, canvas.height/2 * scale); //point where the screen is centered around
    cameraLock = -1;

    //mouse stuff
    drag = -2; //what is being dragged currently (-1 is bg, -2 is nothing, 0 and above are balls)
    dragFoc = new Vector(0,0); //drag focus (where the dragging started)
    dragClient = new Vector(0,0);
    
    mvUp = mvDown = mvLeft = mvRight = false;
    
    document.getElementById('mass').disabled = document.getElementById('massSet').disabled = document.getElementById('radius').disabled = document.getElementById('radiusSet').disabled = document.getElementById('x').disabled = document.getElementById('xSet').disabled = document.getElementById('y').disabled = document.getElementById('ySet').disabled = document.getElementById('vx').disabled = document.getElementById('vxSet').disabled = document.getElementById('vy').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
    
    ballsFromString(templateString);
}





//frame is basically a while loop or draw loop
var frame= function(){
    "use strict";
    var s,i,z;

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
    
    
    if(cameraLock == -1){
        if(mvRight && !mvLeft){
            shift.x += scale * 10;
        }else if(mvLeft && !mvRight){
            shift.x -= scale * 10;
        }
    
        if(mvUp && !mvDown){
            shift.y -= scale * 10;
        
        }else if(mvDown && !mvUp){
            shift.y += scale * 10;
        
        }
    }else{
        shift.x = balls[cameraLock].location.x;
        shift.y = balls[cameraLock].location.y;
    }
    
    //draw reference grid
    if(document.getElementById('grid').checked){
        
        context.strokeStyle = "rgba(0, 255, 255, 0.1)";
        context.lineWidth=2;
        
        var gridShift = new Vector( ( (shift.x / scale) )%canvas.width , (shift.y / scale) % canvas.height);
        
        var lines = 7;//Math.floor(canvas.width / (500 * 6e5/ scale));
        
        
        
        for(i=0;i<lines;i++){
            var x_ = (i * canvas.width/lines - gridShift.x) % canvas.width;
            if(x_ < 0){
                x_ = canvas.width+x_;
            }

            var y_ = (i * canvas.height/lines - gridShift.y) % canvas.height;
            if(y_ < 0){
                y_ = canvas.height+y_;
            }
            
            context.moveTo(x_, 0);
            context.lineTo(x_, canvas.height);
            
            context.moveTo(0, y_);
            context.lineTo(canvas.width, y_);
        }
        context.stroke();
    }
    
    //draws the selection outline
    context.beginPath();
    for(i=0; i<selected.length; i++){
        balls[selected[i]].selected(scale, timeScale * timeSteps, shift);
    }
    
    
    //render all balls
    for(i=0;i<balls.length;i+=1){
        balls[i].render(scale, shift);
    }
    
    //find current mouse function
    var clickR = getClickStyle();
    var mouseOver = findBall(convertToAbs(new Vector(mouseLoc.x, mouseLoc.y)), 20*scale);
    if(clickR == 'create'){
        context.strokeStyle = "rgb(0, 255, 255)";
        context.lineWidth = 2;
        
        context.beginPath();
        
        context.arc(mouseLoc.x, mouseLoc.y, createRadius+2, 0, 2*Math.PI);
        context.stroke();
                
        }else if(clickR == 'delete'){
            if(mouseOver >=0){
                //draw x on top of ball
                var deleteLoc = convertToRel(balls[mouseOver].location);
                
                context.strokeStyle = "rgb(255, 0, 0)";
                context.lineWidth = 5;
                context.beginPath();
                context.moveTo(deleteLoc.x - (balls[mouseOver].radius/scale + 10), deleteLoc.y - (balls[mouseOver].radius/scale + 10));
                context.lineTo(deleteLoc.x + (balls[mouseOver].radius/scale + 10), deleteLoc.y + (balls[mouseOver].radius/scale + 10));

                context.moveTo(deleteLoc.x + (balls[mouseOver].radius/scale + 10), deleteLoc.y - (balls[mouseOver].radius/scale + 10));
                context.lineTo(deleteLoc.x - (balls[mouseOver].radius/scale + 10), deleteLoc.y + (balls[mouseOver].radius/scale + 10));
                context.stroke();
            }
            
        }else if(clickR == 'copy'){
            context.strokeStyle = "rgb(0, 255, 255)";
            context.lineWidth=2;
            
            //find average location
            var avrg = new Vector(0,0);
            for(i=0;i< selected.length; i ++){
                avrg.x+= balls[selected[i]].location.x;
                avrg.y+= balls[selected[i]].location.y;
            }
            avrg.div(selected.length);
            
            //print highlights, where the average location is the mouse
            var loc;
            for(i=0;i< selected.length; i++){
                loc = avrg.sub2(balls[selected[i]].location, avrg);
                loc.add(convertToAbs(mouseLoc));
                loc = convertToRel(loc);
                
                context.beginPath();
                
                context.arc(loc.x, loc.y, balls[selected[i]].radius/scale +2, 0, 2*Math.PI);
                context.stroke();
            }
                
        }else if(clickR == 'orbit'){
            if(mouseOver >=0 && binarySearch(selected, mouseOver) == -1){
                for(i =0; i< selected.length; i++){
                    var diff = balls[selected[i]].location.sub2(balls[mouseOver].location, balls[selected[i]].location);
                    diff = diff.mag() / scale;
                    
                    var orbitTarget = convertToRel(balls[mouseOver].location);
                    
                    context.strokeStyle = "rgb(0, 255, 255)";
                    context.lineWidth=2;
                    
                    context.beginPath();
            
                    context.arc(orbitTarget.x, orbitTarget.y, diff +2, 0, 2*Math.PI);
                    context.stroke();
                }
                
            }
        }else if(clickR == 'drag'){
            if(drag == -2){
                var mouse = new Vector((dragClient.x -mouseLoc.x)*scale, (dragClient.y -mouseLoc.y)*scale);
                mouse.add(dragFoc);
                shift=mouse;
            }else if(drag >=0){
                balls[drag].location = convertToAbs(new Vector(mouseLoc.x, mouseLoc.y));
            }
        }else if(clickR == 'select' && selecting){
            context.beginPath();
                    
            context.strokeStyle = "rgb(0, 255, 255)";
            context.lineWidth=2;
            context.fillStyle = "rgba(0, 255, 255, 0.1)";
            
            var sSConv = convertToRel(selectStart);
            context.rect(sSConv.x, sSConv.y, mouseLoc.x -sSConv.x, mouseLoc.y -sSConv.y);
            context.stroke();
            context.fill();
        }
    
    
    
    animate(frame);
};



window.onload = function() {
   "use strict";
    document.body.appendChild(canvas);
    animate(frame);
};