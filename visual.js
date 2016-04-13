/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxerr: 50*/

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

/** 
Vector class, the functions that end in 2 accept 2 input vectors
*/
function Vector(xx, yy){
    "use strict";
    this.x=xx;
    this.y=yy;
    /**
    Add a vector to this one
    returns void
    */
    this.add=function(vector){
        this.x+=vector.x;
        this.y+=vector.y;
    };
    /**
    Add two vectors
    returns the result
    */
    this.add2=function(v1, v2){
        var v = new Vector(v1.x, v1.y);
        v.add(v2);
        return v;
    };
    
    //subtract a vector from this vector
    this.sub=function(v1){
        this.x-=v1.x;
        this.y-=v1.y;
    };
    
    //subtract second vector from first vector
    this.sub2=function(v1, v2){
        var v = new Vector(v1.x, v1.y);
        v.sub(v2);
        return v;
    };
    
    // get magnitude of this vector
    this.mag=function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };
    
    //normalize this vector
    this.normalize=function(){
        var m= this.mag();
        this.x=this.x/m;
        this.y=this.y/m;
    };
    
    //find dot product between this and another vector
    this.dot=function(vector){
        return (this.x* vector.x +this.y*vector.y);
    };
    
    //multiply this vector by a scalar
    this.mult=function(scalar){
        this.x*=scalar;
        this.y*=scalar;
    };
    
    //multiply a vector by a scalar
    this.mult2=function(v1, s){
        var v = new Vector(v1.x, v1.y);
        v.mult(s);
        return v;
    };
    
    //divide this vector by a scaler
    this.div=function(scalar){
        this.x/=scalar;
        this.y/=scalar;
    };
    
    //divide a vector by a scaler
    this.div2=function(v1, s){
        var v = new Vector(v1.x, v1.y);
        v.div(s);
        return v;
    };
    
    //rotate a vector by input angle, in radians
    this.rotate=function(angle){
        var xx=this.x;
        var yy=this.y;
        this.x = xx * Math.cos(angle) - yy * Math.sin(angle);
        this.y = yy * Math.cos(angle) + xx * Math.sin(angle);
    };
    

}

//Ball class contains data for all physics objects
function Ball(xx,yy, rad, m, hu_, sa_, br_){
    "use strict";
    this.location=new Vector(xx,yy);
    this.velocity=new Vector(0,0);
    this.acceleration=new Vector(0,0);
    //force vector is reset every frame, can't use it to accelerate an object
    this.force=new Vector(0,0);
    this.radius=rad;
    this.mass=m;
    //color
    this.hue=hu_;
    this.sat=sa_;
    this.brig=br_;
    //render the ball
    this.render= function(s, f){
        //s=scale, fx= focusx, fy=focusy
        context.fillStyle = "hsl("+this.hue+", "+this.sat+"%, "+ this.brig+"%)";
       // "hsl(0, 0%, 100%)"
        context.beginPath();
        var x_ = canvas.width/2 + (this.location.x - f.x)/s;
        var y_ = canvas.height/2 + (this.location.y - f.y)/s;
        context.arc(x_,y_,this.radius/s, 0, 2*Math.PI);
        context.fill();
    };
    
    //render the balls selected outline, and its velocity vector
    this.selected= function(s, tS, f){
        
        context.fillStyle = "hsl(180, 100%, 50%)";
        context.beginPath();
        var x_ = canvas.width/2 + (this.location.x - f.x)/s;
        var y_ = canvas.height/2 + (this.location.y - f.y)/s;
        context.arc(x_, y_,this.radius/s + 2, 0, 2*Math.PI);
        context.fill();
        
        //draw velocity vector
        context.lineWidth = 1;
        var r = new Vector(this.velocity.x, this.velocity.y);
        r.normalize();
        r.mult(this.radius + 2);
        context.strokeStyle = "rgb(0, 255, 255)";
        context.beginPath();
        var tox = (r.x/s + x_ + this.velocity.x * tS * 60/s);
        var toy = (r.y/s + y_ + this.velocity.y * tS * 60/s);
        context.moveTo(x_, y_);
        context.lineTo(tox, toy);
        r.normalize();
        r.mult(1.2 * this.radius/s);
        r.rotate(Math.PI + Math.PI /4);
        context.lineTo(tox + r.x, toy + r.y);
        r.rotate(-Math.PI /2);
        context.moveTo(tox, toy);
        context.lineTo(tox +r.x, toy +r.y);
        context.stroke();
        
    };
    
    //update the balls location
    this.update= function(tS){
        this.acceleration.x = this.force.x / (this.mass);
        this.acceleration.y = this.force.y / (this.mass);
        
        this.force.x = this.force.y = 0;
        
        this.location.x += (this.velocity.x * tS) + ((this.acceleration.x * tS * tS) / 2);
		this.velocity.x += (this.acceleration.x * tS);
		this.location.y += (this.velocity.y * tS) + ((this.acceleration.y * tS * tS) / 2);
		this.velocity.y += (this.acceleration.y * tS);
    };
    
}

//calculate and apply the gravitational attraction between 2 physics objects
function gravity(ball1, ball2){
    "use strict";
    //vector points from 2 to 1
    var diff= ball1.location.sub2(ball1.location, ball2.location);
    var distance = diff.mag();
    //calculate gravitations attraction, use diff for direction
    var attraction = (6.674e-11 * ball1.mass * ball2.mass)/ (distance * distance);
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

//do setup stuff here

var balls = []; //array of all physics objects, behaves liek arraylist


var selected= []; //array of ids of balls currently being selected
var selecting = false;

var timeScale=50; //amount of seconds one cycle represents
var timeSteps=10; //amount of cycles per frame of animation

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

var templateString = '[{"location":{"x":390375813.4283814,"y":219649325.32870263},"velocity":{"x":-0.06854915785755715,"y":0.018033897792559872},"acceleration":{"x":4.815132497341387e-27,"y":-1.57877719196864e-26},"force":{"x":0,"y":0},"radius":37800000,"mass":1e+24,"hue":0,"sat":0,"brig":100},{"location":{"x":400325197.9349472,"y":129255979.44430628},"velocity":{"x":-852.3261244973937,"y":-94.35202595499341},"acceleration":{"x":-0.0008904985438345006,"y":0.008020913331357597},"force":{"x":0,"y":0},"radius":3133982.0278660464,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":438301929.1411347,"y":108867945.44157909},"velocity":{"x":-682.5962321020429,"y":-295.547850439235},"acceleration":{"x":-0.001821432141578731,"y":0.004203137515484569},"force":{"x":0,"y":0},"radius":5745633.717754418,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":436767898.731582,"y":78442341.10834798},"velocity":{"x":-636.6493655213825,"y":-209.54336838682468},"acceleration":{"x":-0.0009442435895786485,"y":0.002869699034807473},"force":{"x":0,"y":0},"radius":7573789.900676278,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":553401124.9460012,"y":116159922.231528},"velocity":{"x":-315.2924417744347,"y":-496.35720904665214},"acceleration":{"x":-0.001511414414242425,"y":0.0009588089560354847},"force":{"x":0,"y":0},"radius":8879615.745620465,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":540127429.1091106,"y":43469398.30425339},"velocity":{"x":-409.46441087907004,"y":-347.98025426100764},"acceleration":{"x":-0.0008086733453496268,"y":0.0009509409130682161},"force":{"x":0,"y":0},"radius":9924276.421575813,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":230841560.22397688,"y":446861869.63165855},"velocity":{"x":401.08527817698473,"y":281.806671088706},"acceleration":{"x":0.0004976964640378277,"y":-0.0007085652687514344},"force":{"x":0,"y":0},"radius":11491267.435508836,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":75379528.81600703,"y":324239602.4215844},"velocity":{"x":141.10595785513323,"y":425.62754499657564},"acceleration":{"x":0.0005749958338054787,"y":-0.00019083338461743784},"force":{"x":0,"y":0},"radius":12797093.280453023,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":121928027.30828953,"y":522472579.8158646},"velocity":{"x":303.76527569935826,"y":269.44120784255944},"acceleration":{"x":0.00027037033485793996,"y":-0.0003049303430024443},"force":{"x":0,"y":0},"radius":12797093.280453023,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":761146662.0150483,"y":-68783008.42846324},"velocity":{"x":-231.50258943946045,"y":-297.48501357215616},"acceleration":{"x":-0.00023873768122951343,"y":0.0001856895352170635},"force":{"x":0,"y":0},"radius":13841753.95640837,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":205483016.48647097,"y":729952582.1138659},"velocity":{"x":329.5842001373242,"y":119.51276853910733},"acceleration":{"x":0.00007718734523661395,"y":-0.00021299374860775554},"force":{"x":0,"y":0},"radius":13841753.95640837,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":18650073.975305673,"y":-290689525.55579114},"velocity":{"x":-262.89510429862406,"y":191.4151990132146},"acceleration":{"x":0.00009856666937388787,"y":0.00013533591831232686},"force":{"x":0,"y":0},"radius":15408744.970341394,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":930276178.7094955,"y":-252905881.2685089},"velocity":{"x":-200.93246722043062,"y":-229.48624934300636},"acceleration":{"x":-0.00009755670587066033,"y":0.00008538052260593732},"force":{"x":0,"y":0},"radius":15408744.970341394,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":1152896270.36551,"y":447383274.622706},"velocity":{"x":82.81361614516625,"y":-277.45850728239805},"acceleration":{"x":-0.00010097608908810625,"y":-0.000030161466721875917},"force":{"x":0,"y":0},"radius":17498066.32225209,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":747722593.7468412,"y":1026368719.0366613},"velocity":{"x":251.39770858419234,"y":-111.35381996844133},"acceleration":{"x":-0.00003471870598847578,"y":-0.00007838495482224806},"force":{"x":0,"y":0},"radius":19065057.336185116,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":53043942.19075274,"y":1142331698.6294036},"velocity":{"x":244.71982409822172,"y":89.5325007923426},"acceleration":{"x":0.000023746118050316717,"y":-0.00006494590065480331},"force":{"x":0,"y":0},"radius":25855351.72989488,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":-502641391.25328916,"y":840376420.420038},"velocity":{"x":141.3081962454026,"y":203.43967331554367},"acceleration":{"x":0.000046333587268552003,"y":-0.000032204435769365605},"force":{"x":0,"y":0},"radius":32384480.954615813,"mass":1,"hue":0,"sat":0,"brig":100},{"location":{"x":-837746565.2498229,"y":195075521.8411336},"velocity":{"x":-4.741814868692376,"y":233.06755170151106},"acceleration":{"x":0.00004422236678868363,"y":8.856957450981379e-7},"force":{"x":0,"y":0},"radius":37085453.99641488,"mass":1,"hue":0,"sat":0,"brig":100}]';
var templateArray = JSON.parse(templateString);

var ii, bb;
for(ii=0;ii<templateArray.length;ii++){
        bb = new Ball(templateArray[ii].location.x, templateArray[ii].location.y, templateArray[ii].radius, templateArray[ii].mass, templateArray[ii].hue, templateArray[ii].sat, templateArray[ii].brig);
        bb.velocity = templateArray[ii].velocity;
        balls.push(bb);
}



function deleteAll(){
    "use strict";
    selected= [];
    cameraLock=-1;
    document.getElementById('massInc').disabled = document.getElementById('massSet').disabled = document.getElementById('radiusInc').disabled = document.getElementById('radiusSet').disabled = document.getElementById('xInc').disabled = document.getElementById('xSet').disabled = document.getElementById('yInc').disabled = document.getElementById('ySet').disabled = document.getElementById('vxInc').disabled = document.getElementById('vxSet').disabled = document.getElementById('vyInc').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
    //Resets canvas
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0,0,canvas.width, canvas.height);
    balls=[];
}

function saveToFile(){
    "use strict";
    var blob = new Blob([JSON.stringify(balls)]);
    var d = new Date();
    saveAs(blob, "gravSim_"+d.getTime());
}

function ballsFromString(str){
    "use strict";
    
    var tempArray = JSON.parse(str);
    if(!tempArray){
        return;
    }
    deleteAll();
    var i, b;
    for(i=0;i<tempArray.length;i++){
        b = new Ball(tempArray[i].location.x, tempArray[i].location.y, tempArray[i].radius, tempArray[i].mass, tempArray[i].hue, tempArray[i].sat, tempArray[i].brig);
        b.velocity = tempArray[i].velocity;
        balls.push(b);
    }
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
    
    document.getElementById('massInc').disabled = document.getElementById('massSet').disabled = document.getElementById('radiusInc').disabled = document.getElementById('radiusSet').disabled = document.getElementById('xInc').disabled = document.getElementById('xSet').disabled = document.getElementById('yInc').disabled = document.getElementById('ySet').disabled = document.getElementById('vxInc').disabled = document.getElementById('vxSet').disabled = document.getElementById('vyInc').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
    
    ballsFromString(templateString);
}

function loadFromFile(){
    "use strict";
    var btn = document.getElementById('load');
    var file = btn.files[0];
    if(!file){
        return;
    }
    
    var reader = new FileReader();
    
    //runs when reader is finished loading
    reader.onload = function(e) {
        ballsFromString(e.target.result);
    };
    
    reader.readAsText(file);
}


//refresh all textboxes that could change on one frame
function refreshAll(){
    
    "use strict";
    if(document.activeElement.id !='scale'){
        document.getElementById('scale').value = scale.toExponential();
    }
    
    if(selected.length!=1){
        document.getElementById('mass').innerHTML='N/A';
        document.getElementById('radius').innerHTML='N/A';
        document.getElementById('x').innerHTML='N/A';
        document.getElementById('y').innerHTML='N/A';
        document.getElementById('vx').innerHTML='N/A';
        document.getElementById('vy').innerHTML='N/A';
        return;
    }
    
    
    document.getElementById('mass').innerHTML = balls[selected[0]].mass.toExponential();
    document.getElementById('radius').innerHTML = balls[selected[0]].radius.toExponential();
    document.getElementById('x').innerHTML = balls[selected[0]].location.x.toExponential();
    document.getElementById('y').innerHTML = balls[selected[0]].location.y.toExponential();
    document.getElementById('vx').innerHTML = balls[selected[0]].velocity.x.toExponential();
    document.getElementById('vy').innerHTML = balls[selected[0]].velocity.y.toExponential();
    
    
    
}



//convert user's relative co-ordinate system to the absolute cordinate system
function convertToAbs(loc){
    "use strict";
    var l = new Vector((loc.x - canvas.width/2)*scale, (loc.y - canvas.height/2)*scale);
    l.add(shift);
    return l;
}

//convert from absolute to relative co-ordinate system
function convertToRel(loc){
    "use strict";
    var l = new Vector(canvas.width/2 + (loc.x - shift.x)/scale, canvas.height/2 + (loc.y - shift.y)/scale);
    return l;
}

//find ball that overlaps given co-ordinate, pass in mouse co-ordinates in vector form
function findBall(loc, give){
    "use strict";
    
    //check if point is over a ball
    var v, min = give, minId=-1;
	for(v=0;v<balls.length;v+=1){
        var delta =Math.sqrt((loc.x - balls[v].location.x) * (loc.x - balls[v].location.x) + (loc.y - balls[v].location.y) * (loc.y - balls[v].location.y));
		if(delta < balls[v].radius){
            return v;
        }else if(delta - balls[v].radius < min){
            min = delta - balls[v].radius;
            minId = v;
        }
    }
    
    return minId; 
}

//find balls in given rectangle
function findBallsInRect(corner1, corner2){
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
    
    var v, ids=[];
    for(v=0;v<balls.length; v+=1){
        if(corner1.x < balls[v].location.x && corner2.x > balls[v].location.x && corner1.y < balls[v].location.y && corner2.y > balls[v].location.y){
            ids.push(v);
        }
    }
    return ids;
    
}

//finds the location of a number in a given array, binary search
function binarySearch(array, target){
    "use strict";
    //min inclusive, max exclusive
    var min=0, max=array.length;
    
    while(min < max){
        var mid = (min+max) >> 1;
        if(target > array[mid]){
            min = mid+1;
        }else if(target < array[mid] ){
            max = mid;
        } else if(array[mid] == target){
            return mid;
        }
    }
    return -1;
}

//index of where to insert a number into a sorted list
function binaryInsert(array, target){
    "use strict";
    //min inclusive, max exclusive
    var min=0, max=array.length;
    while(min < max){
        var mid = (min+max) >> 1;
        if(target > array[mid]){
            min = mid+1;
        }else if(target < array[mid] ){
            max = mid;
        }else if(array[mid] == target){
            return mid;
        }
    }
    return min;
}

function getClickStyle(){
    "use strict";
    var clickR = document.getElementsByName("click");
    var v=0;
    for(v = 0; v < clickR.length; v+=1) {
        if(clickR[v].checked == true) {
            return clickR[v].value;
        }
    }
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
    mouse = convertToAbs(mouse);
    
    var clicked = findBall(mouse, 20 * scale);
    //find what function clicking is set to
    var clickR = getClickStyle();
    var i;
     
    if(clicked >= 0){
        if(clickR == 'drag'){
                drag=clicked;
                cameraLock= -1;
                return;
        }
        
        if(clickR == 'select'){
            if(selected.length > 0){
            i = binarySearch(selected, clicked);
                if(i >= 0){
                    if(selected[i] === clicked){
                        selected.splice(i, 1);
                        if(selected.length == 0){
                            document.getElementById('massInc').disabled = document.getElementById('massSet').disabled = document.getElementById('radiusInc').disabled = document.getElementById('radiusSet').disabled = document.getElementById('xInc').disabled = document.getElementById('xSet').disabled = document.getElementById('yInc').disabled = document.getElementById('ySet').disabled = document.getElementById('vxInc').disabled = document.getElementById('vxSet').disabled = document.getElementById('vyInc').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
                        }
                        return;          
                    }
                }
            }
            
            if(selected.length > 0){
                selected.splice(binaryInsert(selected, clicked), 0, clicked);
            }else{
                selected = [clicked];
            }
            
            
            document.getElementById('massInc').disabled = document.getElementById('massSet').disabled = document.getElementById('radiusInc').disabled = document.getElementById('radiusSet').disabled = document.getElementById('xInc').disabled = document.getElementById('xSet').disabled = document.getElementById('yInc').disabled = document.getElementById('ySet').disabled = document.getElementById('vxInc').disabled = document.getElementById('vxSet').disabled = document.getElementById('vyInc').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = false;
            refreshAll();
            return;
        }
        
        if(clickR == 'delete'){
            var index=-1;
            for(i=0;i<selected.length;i++){
                if(selected[i] == clicked){
                    index =i;
                }else if(selected[i]>clicked){
                    selected[i]-=1;
                }
            }
            if(index>=0){
                selected.splice(index, 1);
                if(selected.length == 0){
                        document.getElementById('massInc').disabled = document.getElementById('massSet').disabled = document.getElementById('radiusInc').disabled = document.getElementById('radiusSet').disabled = document.getElementById('xInc').disabled = document.getElementById('xSet').disabled = document.getElementById('yInc').disabled = document.getElementById('ySet').disabled = document.getElementById('vxInc').disabled = document.getElementById('vxSet').disabled = document.getElementById('vyInc').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
                    }
            }
            if(cameraLock == clicked){
                cameraLock=-1;
            }else if(cameraLock>=clicked){
                cameraLock-=1;
            }
            balls.splice(clicked, 1);
            return;
        }
        
        if(clickR == 'orbit' && binarySearch(selected, clicked) == -1){
            //make vector that points from selected to clicked
            for(i=0;i<selected.length; i++){
                var difference = balls[clicked].location.sub2(balls[clicked].location, balls[selected[i]].location);
            
                //find orbital speed at given distance (circular)
                var speed = Math.sqrt(6.67384e-11 * balls[clicked].mass / difference.mag());
            

                //translate speed into vector
                difference.normalize();
                difference.rotate(Math.PI/2);
                difference.mult(speed);
            
                //add the velocity of the object to be orbitted around
                difference.add(balls[clicked].velocity);
            
                //update selected's velocity
                balls[selected[i]].velocity = difference;
            }
            return;
        }
        
        if(clickR == 'lock'){
            cameraLock = clicked;
            return;
        }
    }
    if(clickR == 'select'){
        selectStart = mouse;
        selecting = true;
        
        return;
    }
    
    if(clickR == 'create'){
        balls.push(new Ball(mouse.x , mouse.y, scale * createRadius, 1,0,0,100));
        return;
    }
    
    if(clickR == 'copy'){
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
            var temp = new Ball(loc.x , loc.y, balls[selected[i]].radius, balls[selected[i]].mass, balls[selected[i]].hue, balls[selected[i]].sat, balls[selected[i]].brig);
            temp.velocity.x = balls[selected[i]].velocity.x;
            temp.velocity.y = balls[selected[i]].velocity.y;
            balls.push(temp);
        }
        return;
    }
    
    if(clickR=='drag'){
        //the user did not select anything; wants to move camera around
        dragClient = new Vector(event.clientX, event.clientY);
        dragFoc = new Vector(shift.x, shift.y);
        drag = -2;
    }
};

document.onmouseup = function(event){
    "use strict";
    drag = -1;
    if(selecting){
        selecting = false;
        var mLoc = convertToAbs(new Vector(event.clientX, event.clientY));
        var temp = findBallsInRect(selectStart, mLoc);
        if(temp.length <=0){
            selected = [];
            document.getElementById('massInc').disabled = document.getElementById('massSet').disabled = document.getElementById('radiusInc').disabled = document.getElementById('radiusSet').disabled = document.getElementById('xInc').disabled = document.getElementById('xSet').disabled = document.getElementById('yInc').disabled = document.getElementById('ySet').disabled = document.getElementById('vxInc').disabled = document.getElementById('vxSet').disabled = document.getElementById('vyInc').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = true;
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
        document.getElementById('massInc').disabled = document.getElementById('massSet').disabled = document.getElementById('radiusInc').disabled = document.getElementById('radiusSet').disabled = document.getElementById('xInc').disabled = document.getElementById('xSet').disabled = document.getElementById('yInc').disabled = document.getElementById('ySet').disabled = document.getElementById('vxInc').disabled = document.getElementById('vxSet').disabled = document.getElementById('vyInc').disabled = document.getElementById('vySet').disabled = document.getElementById('copy').disabled = document.getElementById('orbit').disabled = selected.length>=0? false: true;
        
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
        temp = parseFloat(document.getElementById('massInc').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].mass=temp;
        }
    }else if(id =="radius"){
        temp = parseFloat(document.getElementById('radiusInc').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].radius= temp;
        }
    }else if(id =="x"){
        temp = parseFloat(document.getElementById('xInc').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].location.x=temp;
        }
    }else if(id =="y"){
        temp = parseFloat(document.getElementById('yInc').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].location.y= temp;
        }
    }else if(id =="vx"){
        temp = parseFloat(document.getElementById('vxInc').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
            balls[selected[i]].velocity.x=temp;
        }
    }else if(id =="vy"){
        temp = parseFloat(document.getElementById('vyInc').value);
        if(!temp){
            return;
        }
        for(i=0; i<selected.length; i++){
        balls[selected[i]].velocity.y=temp;
        }
    }
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
        
        var lines = 10;//Math.floor(canvas.width / (500 * 6e5/ scale));
        
        
        
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