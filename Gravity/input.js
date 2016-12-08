
//mouse stuff
var drag = -1; //what is being dragged currently (-2 is bg, -1 is nothing, 0 and above are balls)
var dragFoc = new Vector(0,0); //drag focus (where the dragging started)
var selectStart;
var dragClient = new Vector(0,0);
var mouseLoc = new Vector(0,0);


var mvUp=false, mvDown=false, mvLeft=false, mvRight=false;



function allowInputs(allow){
    document.getElementById('mass').disabled = document.getElementById('massSet').disabled = document.getElementById('radius').disabled = document.getElementById('radiusSet').disabled = document.getElementById('x').disabled = document.getElementById('xSet').disabled = document.getElementById('y').disabled = document.getElementById('ySet').disabled = document.getElementById('vx').disabled = document.getElementById('vxSet').disabled = document.getElementById('vy').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = !allow;
}

//refresh all textboxes that could change on one frame
function refreshAll(balls, selected){
    
    "use strict";
    if(document.activeElement.id !='scale'){
        document.getElementById('scale').value = scale.toExponential();
    }
    if (!selected){
        return;
    }
    var printVals = selected.length == 1;
    var properties = ['mass', 'radius', 'x', 'y', 'vx', 'vy']
    var i;
    for(i=0; i <= properties.length; i += 1){
        if(document.activeElement.id != properties[i] && document.activeElement.id != (properties[i] + "Set")){
            document.getElementById(properties[i]).value = printVals ? balls[selected[0]].radius.toExponential() : 'N/A';
        }
    } 
}




function getClickStyle(){
    "use strict";
    var clickR = document.getElementsByName("click");
    var i=0;
    for(i = 0; i < clickR.length; i+=1) {
        if(clickR[i].checked == true) {
            return clickR[v].value;
        }
    }
}

function drag(balls, selected, clicked){
    if(clicked >= 0){
        drag=clicked;
        cameraLock= -1;
        return;
    }
}

function select(balls, selected, clicked){
    //i didn't click on anything
    if(clicked < 0 ){
        selectStart = mouse;
        selecting = true;
        return;
    }
    
    if(selected.length > 0){
        i = selected.indexOf(clicked);
        
        //i clicked on something and it's already selected!
        if(i >= 0){
            selected.splice(i, 1);
            if(selected.length == 0){
                allowInputs(false);
            }
            return;          
        }
    }
    
    //I clicked on something that is not selected!
    selected.push(clicked);
    
    allowInputs(true);
    refreshAll();
    return;
}

function delete(balls, selected, clicked){
    // I didn't click anything!
    if(clicked < 0){
        return;
    }
    
    var selIndex = select.indexOf(clicked);
    if(selIndex >= 0){
        select.splice(selIndex, 1);
    }
    if (selected.length == 0){
        allowInputs(false);
    }
    
    var i;
    for(i=0; i < selected.length; i += 1){
        if (selected[i] > clicked){
            selected[i] = selected[i] - 1;
        }
    }
    
    if (cameraLock == clicked){
        cameraLock = -1;
    } else if (cameraLock > clicked){
        cameraLock = cameraLock - 1;
    }
    
    balls.splice(clicked, 1);
    
}


function orbit(balls, selected, clicked){
    //i didn't click on anything / nothing is selected!
    if(clicked < 0 || selected.length == 0){
        return;
    }
    
    var i;
    for (i = 0; i < selected.length; i += 1){
        //can't orbit around yourself
        if(clicked == selected[i]){
            continue;
        }
        
        var difference = VECTOR.sub(balls[clicked].location, balls[selected[i]].location);
            
        //find orbital speed at given distance (circular)
        var speed = Math.sqrt(6.67384e-11 * balls[clicked].mass / difference.mag());
            

        //translate speed into vector
        difference.normalize();
        difference.rotate(Math.PI/2);
        if(Math.random() > 0.5){
            difference.mult(-1);
        }
        difference.mult(speed);
            
        //add the velocity of the object to be orbitted around
        difference.add(balls[clicked].velocity);
            
        //update selected's velocity
        balls[selected[i]].velocity = difference;
    }
}


function lock(balls, selected, clicked){
    
    cameraLock = clicked >=0? clicked : cameraLock;
    return;
}


function create(balls, selected, clicked){
    balls.push(new Physics.Ball(mouse.x , mouse.y, scale * createRadius, 1,0,0));
    
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
    mouse = Visual.convertToAbs(mouse);
    
    var clicked = findBall(mouse, 20 * scale);
    //find what function clicking is set to
    var clickR = getClickStyle();
    var i;
     
    eval(clickR+"(balls, selected, clicked)");
}
;

document.onmouseup = function(event){
    "use strict";
    drag = -1;
    if(selecting){
        selecting = false;
        var mLoc = convertToAbs(new Vector(event.clientX, event.clientY));
        var temp = findBallsInRect(selectStart, mLoc);
        if(temp.length <=0){
            selected = [];
            document.getElementById('mass').disabled = document.getElementById('massSet').disabled = document.getElementById('radius').disabled = document.getElementById('radiusSet').disabled = document.getElementById('x').disabled = document.getElementById('xSet').disabled = document.getElementById('y').disabled = document.getElementById('ySet').disabled = document.getElementById('vx').disabled = document.getElementById('vxSet').disabled = document.getElementById('vy').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
            return;
        }
        
        var i;
        for(i=0; i< temp.length; i++){
            var insertLoc = binaryInsert(selected, temp[i]);
            if(selected[insertLoc] == temp[i]){
                selected.splice(insertLoc, 1);
            }else{
                selected.splice(insertLoc, 0, temp[i]);
            }
        }
        document.getElementById('mass').disabled = document.getElementById('massSet').disabled = document.getElementById('radius').disabled = document.getElementById('radiusSet').disabled = document.getElementById('x').disabled = document.getElementById('xSet').disabled = document.getElementById('y').disabled = document.getElementById('ySet').disabled = document.getElementById('vx').disabled = document.getElementById('vxSet').disabled = document.getElementById('vy').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = selected.length>=0? false: true;
        
        refreshAll();
        
    }
    
};

var mouseUpdate = function(e){
    "use strict";
    //update mouse location
    mouseLoc.x = e.clientX;
    mouseLoc.y = e.clientY;
    
};
document.addEventListener('mousemove', mouseUpdate, false);

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

window.onkeydown = function(e){
    "use strict";
    
    if(document.activeElement.id){
        return;
    }
    
    var keyCode = e.keyCode || e.which;
    if(keyCode == 65 || keyCode ==37){
        //left arrow or a key, go left
        mvLeft = true;
        cameraLock=-1;
        
    }else if(keyCode == 68 || keyCode ==39){
        //right arrow or d key, go right
        mvRight = true;
        cameraLock=-1;
    }
    if(keyCode == 83 || keyCode ==40){
        //down arrow or s key, go down
        mvDown = true;
        cameraLock=-1;
        
    }else if(keyCode == 87 || keyCode ==38){
        //up arrow or w key, go up
        mvUp = true;
        cameraLock=-1;
        
    }
};

window.onkeyup = function(e){
    "use strict";
    var keyCode = e.keyCode || e.which;
    
    if(keyCode == 65 || keyCode ==37){
        //left arrow or a key, go left
        mvLeft = false;
        
    }else if(keyCode == 68 || keyCode ==39){
        //right arrow or d key, go right
        mvRight = false;
    }
    if(keyCode == 83 || keyCode ==40){
        //down arrow or s key, go down
        mvDown = false;
        
    }else if(keyCode == 87 || keyCode ==38){
        //up arrow or w key, go up
        mvUp = false;
        
    }
};


//handles user input through textboxes, runs on enter
function uInput(id){
    "use strict";
    var i;
    var temp;
    if(id == "timescale"){
        temp=parseFloat(document.getElementById(id).value);
        if(!temp && temp != 0){
            return;
        }
        timeScale=temp;
    }else if(id =="steps"){
        temp=parseInt(document.getElementById(id).value, 10);
        if(!temp && temp != 0){
            return;
        }
        timeSteps=temp;
    }else if(id =="scale"){
        temp=parseFloat(document.getElementById(id).value);
        if(!temp){
            return;
        }
        scale = temp;
    }else if(id =="mass"){
        temp = parseFloat(document.getElementById('mass').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].mass=temp;
        }
    }else if(id =="radius"){
        temp = parseFloat(document.getElementById('radius').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].radius= temp;
        }
    }else if(id =="x"){
        temp = parseFloat(document.getElementById('x').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].location.x=temp;
        }
    }else if(id =="y"){
        temp = parseFloat(document.getElementById('y').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].location.y= temp;
        }
    }else if(id =="vx"){
        temp = parseFloat(document.getElementById('vx').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].velocity.x=temp;
        }
    }else if(id =="vy"){
        temp = parseFloat(document.getElementById('vy').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].velocity.y=temp;
        }
    }
}

