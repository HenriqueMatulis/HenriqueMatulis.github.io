Visual = (function(){
    
    var CANVAS = canvas;
    var OVERLAY = overLayCanvas.getContext("2d")
    
    OVERLAY.font = "12px Arial";
    OVERLAY.fillStyle = "rgb(0,0,0)";
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
        OVERLAY.setLineDash([]);
        OVERLAY.strokeStyle = "rgb(255, 0, 0)";
        OVERLAY.lineWidth = 5;
        OVERLAY.beginPath();
        OVERLAY.moveTo(loc.x - radius, loc.y - radius);
        OVERLAY.lineTo(loc.x + radius, loc.y + radius);

        OVERLAY.moveTo(loc.x + radius, loc.y - radius);
        OVERLAY.lineTo(loc.x - radius, loc.y + radius);
        OVERLAY.stroke();
    }
    
    var DRAWRECT = function(corner1, corner2){
        
        OVERLAY.beginPath();
                    
        OVERLAY.setLineDash([]);
        OVERLAY.strokeStyle = "rgb(0, 255, 255)";
        OVERLAY.lineWidth=2;
        OVERLAY.fillStyle = "rgba(0, 255, 255, 0.1)";

        OVERLAY.rect(corner1.x, corner1.y, corner2.x - corner1.x, corner2.y - corner1.y);
        OVERLAY.stroke();
        OVERLAY.fill();
    };
    
    
    var DRAWCIRCLE = function drawCircle(loc, r){
        OVERLAY.beginPath();
                    
        OVERLAY.setLineDash([]);
        OVERLAY.strokeStyle = "rgb(0, 255, 255)";
        OVERLAY.lineWidth=2;

        OVERLAY.arc(loc.x, loc.y, r, 0, 2*Math.PI);
        OVERLAY.stroke();
    };
    
    var DRAWVECTOR = function(vec, origin){
        origin = (typeof origin === 'undefined') ? new Vector() : origin;
        
        
        
        var tip = VECTOR.add(origin, vec);
        
        //line from origin to tip of vector
        OVERLAY.moveTo(origin.x, origin.y);
        OVERLAY.lineTo(tip.x, tip.y);
        
        
        var copy = new Vector(vec.x, vec.y);
        copy.mult(0.1);
        
        //line from where tip of arrow to down-left
        copy.rotate(Math.PI + Math.PI / 4);
        OVERLAY.lineTo(tip.x + copy.x, tip.y + copy.y);
        
        
        
        //line from tip of arrow to down-right
        OVERLAY.moveTo(tip.x, tip.y);
        copy.rotate(-Math.PI /2);
        OVERLAY.lineTo(tip.x + copy.x, tip.y + copy.y);
        
        
        
    }
    
//render the balls selected outline, and its velocity vector
    function SELECT(ball, timeSpan){
        
        OVERLAY.strokeStyle = "rgb(0, 255, 255)";
        OVERLAY.fillStyle = "rgb(0, 255, 255)";
        OVERLAY.setLineDash([]);
        OVERLAY.lineWidth = 1;
        
       
        OVERLAY.beginPath();
        
        //draw outline
        var pos = CONVERTTOREL(ball.location);
        var rad = ball.radius / SCALE
        OVERLAY.arc(pos.x, pos.y, rad, 0, 2*Math.PI);
        
        //draw velocity vector
        var origin = VECTOR.normalize(ball.velocity);
        origin.mult(rad);
        origin.add(pos);
        DRAWVECTOR(VECTOR.mult(ball.velocity, timeSpan * 60 / SCALE), origin);
        OVERLAY.stroke();
        
        
        //draw acc. vector
        origin = VECTOR.normalize(ball.acceleration);
        origin.mult(rad);
        origin.add(pos);
        OVERLAY.setLineDash([3]);
        DRAWVECTOR(VECTOR.mult(ball.acceleration, timeSpan * timeSpan * 3600 / SCALE), origin);
        OVERLAY.stroke();
        
        OVERLAY.beginPath();
        OVERLAY.fillStyle = "rgb(255, 255, 255)";
        OVERLAY.lineWidth = 3;
        OVERLAY.setLineDash([]);
        
        OVERLAY.rect(pos.x - 10 * rad, pos.y - 10, -150, 100);
        OVERLAY.stroke();
        OVERLAY.fill();
        
        //OVERLAY.fillText(ball.velocity.x.toFixed(3) + ", "+ball.velocity.y.toFixed(3), pos.x + ball.radius / SCALE, pos.y - ball.radius / SCALE);
        
        
    };
    
    
//render one ball
    function render(ball, timeSpan, isSelected) {
        if(isSelected){
            SELECT(ball, timeSpan);
        }
        
        
        //draw ball
        CONTEXT.fillStyle = "rgba("+ball.red+","+ball.green+","+ball.blue+","+parseFloat(document.getElementById('opacity').value)+")";
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
        
        CONTEXT.fillStyle = "rgba(0,0,0,"+ (document.getElementById('reset').checked ? 1 : 0) +")";
        CONTEXT.fillRect(0,0,canvas.width, canvas.height);
        
        OVERLAY.clearRect(0, 0, canvas.width, canvas.height);
        
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
        overLay: OVERLAY,
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