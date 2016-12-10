Visual = (function(){
    
    var CANVAS = document.getElementById("myCanvas");
    CANVAS.width = window.innerWidth * 0.85;
    CANVAS.height = window.innerHeight;
    var CONTEXT = CANVAS.getContext("2d");
    var SCALE = 1;
    var CAMERALOCK = -1;
    var FOCUS = new Vector();
    var ALLSELECTED = [];
    var MOVE = new Vector();
    
    SETSCALE = function setScale(newScale){
        SCALE = newScale;
    }
    
    GETSCALE = function getScale(){
        return SCALE;
    }
    
    SETCAMERA = function setCamera(newId){
        CAMERALOCK = newId;
    }
    
    GETCAMERA = function getCamera(){
        return CAMERALOCK;
    }
    
    
    var DRAWX = function(loc, radius){
        CONTEXT.setLineDash([]);
        CONTEXT.strokeStyle = "rgb(255, 0, 0)";
        CONTEXT.lineWidth = 5;
        CONTEXT.beginPath();
        CONTEXT.moveTo(loc.x - radius, loc.y - radius);
        CONTEXT.lineTo(loc.x + radius, loc.y + radius);

        CONTEXT.moveTo(loc.x + radius, loc.y - radius);
        CONTEXT.lineTo(loc.x - radius, loc.y + radius);
        CONTEXT.stroke();
    }
    
    var DRAWRECT = function(corner1, corner2){
        
        context.beginPath();
                    
        CONTEXT.setLineDash([]);
        CONTEXT.strokeStyle = "rgb(0, 255, 255)";
        CONTEXT.lineWidth=2;
        CONTEXT.fillStyle = "rgba(0, 255, 255, 0.1)";

        CONTEXT.rect(corner1.x, corner1.y, corner2.x - corner1.x, corner2.y - corner1.y);
        CONTEXT.stroke();
        CONTEXT.fill();
    };
    
    
    var DRAWCIRCLE = function drawCircle(loc, r){
        context.beginPath();
                    
        CONTEXT.setLineDash([]);
        CONTEXT.strokeStyle = "rgb(0, 255, 255)";
        CONTEXT.lineWidth=2;

        CONTEXT.arc(loc.x, loc.y, r, 0, 2*Math.PI);
        CONTEXT.stroke();
    };
    
    var DRAWVECTOR = function(vec, origin){
        origin = (typeof origin === 'undefined') ? new Vector() : origin;
        
        CONTEXT.lineWidth = 1;
        
        CONTEXT.strokeStyle = "rgb(0, 255, 255)";
        CONTEXT.beginPath();
        
        var tip = VECTOR.add(origin, vec);
        
        //line from origin to tip of vector
        CONTEXT.moveTo(origin.x, origin.y);
        CONTEXT.lineTo(tip.x, tip.y);
        
        
        var copy = new Vector(vec.x, vec.y);
        copy.mult(0.1);
        
        //line from where tip of arrow to down-left
        copy.rotate(Math.PI + Math.PI / 4);
        CONTEXT.lineTo(tip.x + copy.x, tip.y + copy.y);
        
        
        
        //line from tip of arrow to down-right
        CONTEXT.moveTo(tip.x, tip.y);
        copy.rotate(-Math.PI /2);
        CONTEXT.lineTo(tip.x + copy.x, tip.y + copy.y);
        
        CONTEXT.stroke();
        
    }
    
//render the balls selected outline, and its velocity vector
    function SELECT(ball, timeSpan){
        
        CONTEXT.fillStyle = "rgb(0, 255, 255)";
        //draw outline
        CONTEXT.beginPath();
        var pos = CONVERTTOREL(ball.location);
        CONTEXT.arc(pos.x, pos.y,ball.radius/SCALE + 2, 0, 2*Math.PI);
        CONTEXT.fill();
        
        
        var origin = VECTOR.normalize(ball.velocity);
        origin.mult(ball.radius / SCALE + 2);
        origin.add(pos);
        CONTEXT.setLineDash([]);
        DRAWVECTOR(VECTOR.mult(ball.velocity, timeSpan * 60 / SCALE), origin);
        
        origin = VECTOR.normalize(ball.acceleration);
        origin.mult(ball.radius / SCALE + 2);
        origin.add(pos);
        CONTEXT.setLineDash([3]);
        DRAWVECTOR(VECTOR.mult(ball.acceleration, timeSpan * timeSpan * 3600 / SCALE), origin);
        //context.fillText(ball.velocity.x.toFixed(3) + ", "+ball.velocity.y.toFixed(3), pos.x + ball.radius / SCALE, pos.y - ball.radius / SCALE);
        
        
    };
    
    
//render one ball
    function render(ball, timeSpan, isSelected) {
        if(isSelected){
            SELECT(ball, timeSpan);
        }
        
        
        //draw ball
        CONTEXT.fillStyle = ("rgb(255,255,255)");
        CONTEXT.beginPath();
        
        var pos = CONVERTTOREL(ball.location);
        CONTEXT.arc(pos.x, pos.y, ball.radius / SCALE, 0, 2*Math.PI);
        CONTEXT.fill();
        
    };
    
    var RENDERALL = function renderAll(balls, timeSpan) {
        if(CAMERALOCK >= 0){
            FOCUS.x = balls[CAMERALOCK].location.x;
            FOCUS.y = balls[CAMERALOCK].location.y;
        }else{
            FOCUS.add(VECTOR.mult(MOVE, SCALE));
            
        }
        var trace = parseFloat(document.getElementById('trace').value);
        trace = 0.01 / (trace + 0.01);
        console.log(trace);
        context.fillStyle = "rgba(0,0,0,"+trace +")";
        context.fillRect(0,0,canvas.width, canvas.height);
        
        var i;
        for(i = 0; i < balls.length; i += 1){
            render(balls[i], timeSpan, ALLSELECTED.indexOf(i) != -1);
        }
    };
    
    
    //convert user's relative co-ordinate system to the absolute cordinate system
    var CONVERTTOABS = function convertToAbs(loc){
        "use strict";
        var l = new Vector((loc.x - CANVAS.width/2)*SCALE, (loc.y - CANVAS.height/2)*SCALE);
        l.add(FOCUS);
        return l;
    }

    
    //convert from absolute to relative co-ordinate system
    var CONVERTTOREL = function convertToRel(loc){
        "use strict";
        var l = new Vector(CANVAS.width/2 + (loc.x - FOCUS.x)/SCALE, CANVAS.height/2 + (loc.y - FOCUS.y)/SCALE);
        return l;
    }
    
    
    return {
        render: RENDERALL,
        convertToAbs: CONVERTTOABS,
        convertToRel: CONVERTTOREL,
        canvas: CANVAS,
        context: CONTEXT,
        setScale: SETSCALE,
        getScale: GETSCALE,
        focus: FOCUS,
        setCamera: SETCAMERA,
        getCamera: GETCAMERA,
        allSelected: ALLSELECTED,
        move: MOVE,
        drawRect: DRAWRECT,
        drawVector: DRAWVECTOR,
        drawX: DRAWX,
        drawCircle: DRAWCIRCLE
    };

}());