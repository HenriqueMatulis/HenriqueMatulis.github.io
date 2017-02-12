
//mouse stuff
 //what is being dragged currently (-2 is bg, -1 is nothing, 0 and above are balls)
var dragFoc = new Vector(); //drag focus (where the dragging started)

var mouseLoc = new Vector();

var clickStart;
var clicking = false;
var clickId;



var allowInputs = function allowInputs(allow){
    document.getElementById('mass').disabled = document.getElementById('massBtn').disabled = document.getElementById('radius').disabled = document.getElementById('radiusBtn').disabled = document.getElementById('location.x').disabled = document.getElementById('location.xBtn').disabled = document.getElementById('location.y').disabled = document.getElementById('location.yBtn').disabled = document.getElementById('velocity.x').disabled = document.getElementById('velocity.xBtn').disabled = document.getElementById('velocity.y').disabled = document.getElementById('velocity.yBtn').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = !allow;
};
var refreshMain = function refreshMain(){
    
    "use strict";
    
    if(Visual.allSelected.length<1){
        document.getElementById('location.x').value='N/A';
        document.getElementById('location.y').value='N/A';
        document.getElementById('velocity.x').value='N/A';
        document.getElementById('velocity.y').value='N/A';
        return;
    }
    
    if(Visual.allSelected.length>1){
        if (document.activeElement.id != 'mass' && document.activeElement.id != 'massBtn'){
            document.getElementById('mass').value = '0';
        }
        
        if (document.activeElement.id != 'radius' && document.activeElement.id != 'radiusBtn'){
            document.getElementById('radius').value = '0';
        }
        
        if (document.activeElement.id != 'location.x' && document.activeElement.id != 'location.xBtn'){
            document.getElementById('location.x').value = '0';
        }
        
        if (document.activeElement.id != 'location.y' && document.activeElement.id != 'location.yBtn'){
            document.getElementById('location.y').value = '0';
        }
        
        if (document.activeElement.id != 'velocity.x' && document.activeElement.id != 'velocity.xBtn'){
            document.getElementById('velocity.x').value = '0';
        }
        
        if (document.activeElement.id != 'velocity.y' && document.activeElement.id != 'velocity.yBtn'){
            document.getElementById('velocity.y').value = '0';
        }
        
        return;
    }
    
    if (document.activeElement.id != 'mass' && document.activeElement.id != 'massBtn'){
        document.getElementById('mass').value = Physics.Balls[Visual.allSelected[0]].mass.toExponential();
    }
    
    if (document.activeElement.id != 'radius' && document.activeElement.id != 'radiusBtn'){
        document.getElementById('radius').value = Physics.Balls[Visual.allSelected[0]].radius.toExponential();
    }
    
    if (document.activeElement.id != 'location.x' && document.activeElement.id != 'location.xBtn'){
        document.getElementById('location.x').value = Physics.Balls[Visual.allSelected[0]].location.x.toExponential();
    }
    
    if (document.activeElement.id != 'location.y' && document.activeElement.id != 'location.yBtn'){
        document.getElementById('location.y').value = Physics.Balls[Visual.allSelected[0]].location.y.toExponential();
    }
    
    if (document.activeElement.id != 'velocity.x' && document.activeElement.id != 'velocity.xBtn'){
         document.getElementById('velocity.x').value = Physics.Balls[Visual.allSelected[0]].velocity.x.toExponential();
    }
    
    if (document.activeElement.id != 'velocity.y' && document.activeElement.id != 'velocity.yBtn'){
        document.getElementById('velocity.y').value = Physics.Balls[Visual.allSelected[0]].velocity.y.toExponential();
    } 
};

//refresh all textboxes
var refreshAll = function refreshAll(){
    
    "use strict";
    if(document.activeElement.id !='timescale'){
        document.getElementById('timescale').value = timeScale;
    }
    
    if(document.activeElement.id !='steps'){
        document.getElementById('steps').value = timeStep;
    }
    
    if(document.activeElement.id !='scale'){
        document.getElementById('scale').value = Visual.getScale().toExponential();
    }
    
    
    if(document.activeElement.id !='scale'){
        document.getElementById('scale').value = Visual.getScale().toExponential();
    }
    
    var properties = ['mass', 'radius', "location.x", "location.y", "velocity.x", "velocity.y"];
    var i;
    
    for(i=0; i < properties.length; i += 1){
        if(document.activeElement.id != properties[i] && document.activeElement.id != (properties[i] + "Btn")){
            if(Visual.allSelected.length == 1){
                eval("document.getElementById(properties[i]).value = Physics.Balls[Visual.allSelected[0]]." + properties[i] + ".toExponential()");
                eval("document.getElementById('"+properties[i]+"Btn').value = 'Set'");
                
            } else if( Visual.allSelected.length != 0){
                eval("document.getElementById(properties[i]).value = 0");
                eval("document.getElementById('"+properties[i]+"Btn').value = \'Add\'");
                
            }else{
                eval("document.getElementById(properties[i]).value = 'N/A'");
                
            }
        }
    } 
};


var deletehAll = function deleteAll(){
    "use strict";
    Visual.selected.length = 0;
    Visual.setCamera(-1);
    Physics.Balls.length = 0;
    allowInputs(false);
    
    //Clear canvas
    Visual.fillStyle = "rgb(0,0,0)";
    context.fillRect(0,0,canvas.width, canvas.height);
}



function getClickStyle(){
    "use strict";
    var clickR = document.getElementsByName("click");
    var i=0;
    for(i = 0; i < clickR.length; i+=1) {
        if(clickR[i].checked == true) {
            return clickR[i].value;
        }
    }
};


var dragDraw = function dragDraw(){
    if(clickId){
        Physics.setPause(true);
        clickId.location = Visual.convertToAbs(mouseLoc);
    }
    
};

var drag = function drag(clicked){
    //user dragging physics object
    if(clicked >= 0){
        clickId = Physics.Balls[clicked];
        if(Visual.getCamera() == clicked){
            Visual.setCamera(-1)
        }
        return;
    }
};

var dragVelocityDraw = function dragVelocityDraw(){
    
    if(clickId){
        Physics.setPause(true);
        clickId.velocity = Visual.convertToAbs(mouseLoc);
        clickId.velocity.sub(clickId.location);
        var mag = clickId.velocity.mag() - clickId.radius;
        mag = mag / timeScale / timeStep / 60;
        clickId.velocity.normalize();
        clickId.velocity.mult(mag);
    }
    
};

var dragVelocity = function dragVelocity(clicked){
    //user dragging physics object
    if(clicked >= 0){
        clickId = Physics.Balls[clicked];
        return;
    }
};

var selectDraw = function selectDraw(){
    if(clicking){
        Visual.drawRect(Visual.convertToRel(clickStart), mouseLoc);
    }
}

var select = function select(clicked){
    //i didn't click on anything
    if(clicked < 0 ){
        clickStart = Visual.convertToAbs(mouseLoc);
        clicking = true;
        return;
    }
    
    if(Visual.allSelected.length > 0){
        i = Visual.allSelected.indexOf(clicked);
        
        //i clicked on something and it's already selected!
        if(i >= 0){
            Visual.allSelected.splice(i, 1);
            if(Visual.allSelected.length == 0){
                allowInputs(false);
            }
            return;          
        }
    }
    
    //I clicked on something that is not selected!
    Visual.allSelected.push(clicked);
    
    allowInputs(true);
    refreshAll();
    return;
};

var removeDraw = function removeDraw(){
    var hover = Physics.findBall(Visual.convertToAbs(mouseLoc), 4 * Visual.getScale());
    if(hover == -1){
        return;
    }
    //draw x on top of ball
    var deleteLoc = Visual.convertToRel(Physics.Balls[hover].location);
    
    Visual.drawX(deleteLoc, Physics.Balls[hover].radius / Visual.getScale());
}
var remove = function remove(clicked){
    // I didn't click anything!
    if(clicked < 0){
        return;
    }
    
    var selIndex = Visual.allSelected.indexOf(clicked);
    if(selIndex >= 0){
        Visual.allSelected.splice(selIndex, 1);
    }
    if (Visual.allSelected.length == 0){
        allowInputs(false);
    }
    
    var i;
    for(i=0; i < Visual.allSelected.length; i += 1){
        if (Visual.allSelected[i] > clicked){
            Visual.allSelected[i] = Visual.allSelected[i] - 1;
        }
    }
    
    if (Visual.getCamera() == clicked){
        Visual.setCamera(-1);
    } else if (Visual.getCamera() > clicked){
        Visual.setCamera(Visual.getCamera() - 1);
    }
    
    Physics.Balls.splice(clicked, 1);
    
};

var orbitDraw = function(){
    var hover = Physics.findBall(Visual.convertToAbs(mouseLoc), 4 * Visual.getScale());
    if(hover == -1){
        return;
    }
    var i;
    for(i=0; i < Visual.allSelected.length; i += 1){
        if(hover != Visual.allSelected[i]){
            var dis = VECTOR.sub(Physics.Balls[hover].location, Physics.Balls[Visual.allSelected[i]].location).mag() / Visual.getScale();
            Visual.drawCircle(Visual.convertToRel(Physics.Balls[hover].location), dis)
        }
    }
};

var orbit = function orbit(clicked){
    //i didn't click on anything / nothing is selected!
    if(clicked < 0 || Visual.allSelected.length == 0){
        return;
    }
    
    var i;
    for (i = 0; i < Visual.allSelected.length; i += 1){
        //can't orbit around yourself
        if(clicked == Visual.allSelected[i]){
            continue;
        }
        
        var difference = VECTOR.sub(Physics.Balls[clicked].location, Physics.Balls[Visual.allSelected[i]].location);
            
        //find orbital speed at given distance (circular)
        var speed = Math.sqrt(6.67384e-11 * Physics.Balls[clicked].mass / difference.mag());
            

        //translate speed into vector
        difference.normalize();
        difference.rotate(Math.PI/2);
        if(Math.random() > 0.5){
            difference.mult(-1);
        }
        difference.mult(speed);
            
        //add the velocity of the object to be orbitted around
        difference.add(Physics.Balls[clicked].velocity);
            
        //update selected's velocity
        Physics.Balls[Visual.allSelected[i]].velocity = difference;
    }
};

var lockDraw = function lockDraw(){
    
}

var lock = function lock(clicked){
    if(clicked >= 0){
        Visual.setCamera(clicked);
    }
    return;
};

var createDraw = function createDraw(){
    Visual.drawCircle(mouseLoc, 15 + 2);
}

var create = function create(clicked){
    var mouseAbs = Visual.convertToAbs(mouseLoc);
    Physics.Balls.push(new Physics.Ball(mouseAbs.x , mouseAbs.y, Visual.getScale() * 15, 1));
    
};


var copyDraw = function copyDraw(){
    if(Visual.allSelected.length == 0){
        return;
    }
    
    //average location of all balls
    var avrg = new Vector();
    for(i=0;i< Visual.allSelected.length; i ++){
        avrg.add(Physics.Balls[Visual.allSelected[i]].location);
    }
    
    avrg.div(Visual.allSelected.length);
            
    
    var loc;
    for(i=0;i< Visual.allSelected.length; i++){
        
        loc = VECTOR.sub(Physics.Balls[Visual.allSelected[i]].location, avrg);
        loc.add(Visual.convertToAbs(mouseLoc));
        
        loc = Visual.convertToRel(loc);
        
        Visual.drawCircle(loc, 2 + Physics.Balls[Visual.allSelected[i]].radius / Visual.getScale());
    }
    
}
var copy = function copy(clicked){
    //find average location
    if(Visual.allSelected.length == 0){
        return;
    }
    
    //average location of all balls
    var avrg = new Vector(0,0);
    for(i=0;i< Visual.allSelected.length; i ++){
        avrg.x+= Physics.Balls[Visual.allSelected[i]].location.x;
        avrg.y+= Physics.Balls[Visual.allSelected[i]].location.y;
    }
    
    avrg.div(Visual.allSelected.length);
            
    
    var loc;
    for(i=0;i< Visual.allSelected.length; i++){
        
        loc = VECTOR.sub(Physics.Balls[Visual.allSelected[i]].location, avrg);
        loc.add(Visual.convertToAbs(mouseLoc));
        var temp = new Physics.Ball(loc.x , loc.y, Physics.Balls[Visual.allSelected[i]].radius, Physics.Balls[Visual.allSelected[i]].mass);
        temp.velocity.x = Physics.Balls[Visual.allSelected[i]].velocity.x;
        temp.velocity.y = Physics.Balls[Visual.allSelected[i]].velocity.y;
        Physics.Balls.push(temp);
    }
};


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
    
    var clicked = Physics.findBall(mouse, 4 * Visual.getScale());
    //find what function clicking is set to
    var clickR = getClickStyle();
    var i;
    
    eval(clickR+"(clicked)");
}
;

function selectRect(){
    clicking = false;
    var mLoc = Visual.convertToAbs(mouseLoc);
    var highlighted = Physics.findBallInRect(clickStart, mLoc);
    
    if(highlighted.length ==0){
        Visual.allSelected.length = 0;
        allowInputs(false);
        return;
    }
    
    highlighted.forEach(select);
    
    allowInputs(Visual.allSelected.length>=0);
    refreshAll();
    
}

document.onmouseup = function(event){
    "use strict";
    if(clickId){
        //Physics.setPause(false);
        clickId = undefined;
    }
    if(clicking){
        selectRect();
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
    
    Visual.setScale(Visual.getScale() * Math.pow(1.0717734625362931642130063250233,-delta));
    document.getElementById('scale').value = Visual.getScale().toExponential();
};

overLayCanvas.addEventListener('DOMMouseScroll',zoom,false); // for Firefox
overLayCanvas.addEventListener('mousewheel',    zoom,false); // for everyone else

window.onkeydown = function(e){
    "use strict";
    
    var keyCode = e.keyCode || e.which;

    if(keyCode == 65 || keyCode ==37){
        //left arrow or a key, go left
        
        document.activeElement.blur();
        Visual.move.x = -15;
        Visual.setCamera(-1);
        
    }else if(keyCode == 68 || keyCode ==39){
        //right arrow or d key, go right
        
        document.activeElement.blur();
        Visual.move.x = 15;
        Visual.setCamera(-1);
    }
    if(keyCode == 83 || keyCode ==40){
        //down arrow or s key, go down
        
        document.activeElement.blur();
        Visual.move.y = 15;
        Visual.setCamera(-1);
        
    }else if(keyCode == 87 || keyCode ==38){
        //up arrow or w key, go up
        
        document.activeElement.blur();
        Visual.move.y = -15;
        Visual.setCamera(-1);
        
    }
};

window.onkeyup = function(e){
    "use strict";
    var keyCode = e.keyCode || e.which;
    
    if(keyCode == 80){
        //'p' button, toggles pause
        Physics.togglePause();
    } 
    
    if(keyCode == 67){
        //'c' button, toggles long exposure
        document.getElementById('reset').checked = !document.getElementById('reset').checked
    }
    
    if(keyCode == 65 || keyCode == 37){
        //left arrow or a key, go left
        Visual.move.x = Visual.move.x < 0? 0 : Visual.move.x;
        
    }else if(keyCode == 68 || keyCode == 39){
        //right arrow or d key, go right
        Visual.move.x = Visual.move.x > 0? 0 : Visual.move.x;
    }
    if(keyCode == 83 || keyCode == 40){
        //down arrow or s key, go down
        Visual.move.y = Visual.move.y > 0? 0 : Visual.move.y;
        
    }else if(keyCode == 87 || keyCode == 38){
        //up arrow or w key, go up
        Visual.move.y = Visual.move.y < 0? 0 : Visual.move.y;
        
    }
};


//handles user input through textboxes, runs on enter
function uInput(id){
    "use strict";
    var i;
    
    var range = {
        "mass": function(x){ return x != 0},
        "radius": function(x){ return x > 0},
        "scale": function(x){ return x > 0}
    };
    
    var inputFunction = {
        "timescale": parseFloat, 
        "steps": parseInt, 
        "scale": parseFloat,
        "mass": parseFloat, 
        "radius": parseFloat, 
        "location.x": parseFloat, 
        "location.y": parseFloat, 
        "velocity.x": parseFloat, 
        "velocity.y": parseFloat
    };
    
    if (!inputFunction[id]){
        return;
    }
    
    var input = inputFunction[id](document.getElementById(id).value);
    
    //no input
    if(!input && input != 0){
        return;
    }
    
    //input out of range
    if(!(!range[id]) && !(range[id](input)) ){
        return;
    }
    
    var physicsInputs = ["mass", "radius", "location.x", "location.y", "velocity.x", "velocity.y"];
    
    if((physicsInputs.indexOf(id) != -1)){
        if(Visual.allSelected.length != 1){
            Visual.allSelected.forEach( function(index){eval("Physics.Balls["+index+"]." + id + " += input")});
        }else{
            eval("Physics.Balls[Visual.allSelected[0]]." + id + " = input");
        }
        return;
    }

    var otherInputs = {
        "timescale": "timeScale = input", 
        "steps": "timeStep = input", 
        "scale": "Visual.setScale(input)"
    };

    eval(otherInputs[id]);
    
}



function inputLoop(){
    refreshMain();
    //check if mouse is within canvas
    if(mouseLoc.x > canvas.width){
        return;
    }
    
    var clickStyle = getClickStyle();
    if(["select", "drag", "dragVelocity", "create", "remove", "lock", "copy", "orbit"].indexOf(clickStyle) == -1){
        return;
    }
    
    eval(clickStyle+"Draw()");
    
}
