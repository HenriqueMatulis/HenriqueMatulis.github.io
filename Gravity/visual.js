Visual = (function(){
    
    var CANVAS = canvas;
    var OVERLAY = overLayCanvas.getContext("2d")
    
    OVERLAY.font = "12px Arial";
    OVERLAY.fillStyle = "rgb(0,0,0)";
    var CONTEXT = CANVAS.getContext("2d");
    var SCALE = 1;
    var CAMERALOCK = -1;
    var LAST_FOCUS = null;
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
        radius = radius + 5;
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
        
        
        
        var copy = new Vector(vec.x, vec.y);
        
        if (Math.abs(copy.x) > CANVAS.width){
            var divisor = Math.abs(copy.x) / CANVAS.width;
            copy.div(divisor);
        }
        
        if (Math.abs(copy.y) > CANVAS.height){
            var divisor = Math.abs(copy.y) / CANVAS.height;
            copy.div(divisor);
        }
        
        
        var tip = VECTOR.add(copy, origin);
        
        
        
        //line from origin to tip of vector
        OVERLAY.moveTo(origin.x, origin.y);
        OVERLAY.lineTo(tip.x, tip.y);
        
        
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
        var rad = Math.max(ball.radius / SCALE, 1)
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
        
    };
    
    function getFocus(ballLock, step, length){
        if (CAMERALOCK >= 0){
            return ballLock.locationHistory[step];
        }else {
            let alpha = (step+1)/length;
            let beta = 1 - alpha;
            return new Vector(
                alpha * LAST_FOCUS.x + beta * FOCUS.x,
                alpha * LAST_FOCUS.y + beta * FOCUS.y,
            );
        }

    }
//render one ball
    function render(ball, timeSpan, isSelected, ballLock) {
        if(isSelected){
            SELECT(ball, timeSpan);
        }
        
        var radius = Math.max(ball.radius / SCALE, 1);
        
        //draw ball
        CONTEXT.strokeStyle = "rgba("+ball.red+","+ball.green+","+ball.blue+","+parseFloat(document.getElementById('opacity').value)+")";
        CONTEXT.lineWidth = radius * 2 + 1;

        CONTEXT.beginPath();
        CONTEXT.lineCap = "round";
        let length = ball.locationHistory.length;
        let loc = CONVERTTORELFORFOCUS(ball.locationHistory[0], getFocus(ballLock, 0, length));
        CONTEXT.moveTo(loc.x, loc.y);
        for (let i=1; i< ball.locationHistory.length; i++){
            loc = CONVERTTORELFORFOCUS(ball.locationHistory[i], getFocus(ballLock, i, length));
            CONTEXT.lineTo(loc.x, loc.y);
        }
        CONTEXT.stroke();
        
        
    };
    
    var RENDERALL = function renderAll(balls, timeSpan) {
        let ballLock = undefined;
        if(CAMERALOCK >= 0){
            ballLock = balls[CAMERALOCK]
            FOCUS.x = ballLock.location.x;
            FOCUS.y = ballLock.location.y;
        }else{
            FOCUS.add(VECTOR.mult(MOVE, SCALE));
        }
        if (LAST_FOCUS === null) {
            LAST_FOCUS = new Vector(FOCUS.x, FOCUS.y)
        }
        
        CONTEXT.fillStyle = "rgba(0,0,0,"+ (document.getElementById('reset').checked ? 0 : 1) +")";
        CONTEXT.fillRect(0,0,canvas.width, canvas.height);
        
        OVERLAY.clearRect(0, 0, canvas.width, canvas.height);
        
        var i;
        for(i = 0; i < balls.length; i += 1){
            render(balls[i], timeSpan, ALLSELECTED.indexOf(i) != -1, ballLock);
        }
        LAST_FOCUS.x = FOCUS.x;
        LAST_FOCUS.y = FOCUS.y;
    };
    
    
    //convert user's relative co-ordinate system to the absolute cordinate system
    var CONVERTTOABS = function convertToAbs(loc){
        "use strict";
        var l = new Vector((loc.x - CANVAS.width/2)*SCALE, (loc.y - CANVAS.height/2)*SCALE);
        l.add(FOCUS);
        return l;
    }

    //convert from absolute to relative co-ordinate system
    var CONVERTTORELFORFOCUS = function convertToRel(loc, focus){
        "use strict";
        var l = new Vector(CANVAS.width/2 + (loc.x - focus.x)/SCALE, CANVAS.height/2 + (loc.y - focus.y)/SCALE);
        return l;
    }
    
    //convert from absolute to relative co-ordinate system
    var CONVERTTOREL = function convertToRel(loc){
        "use strict";
        return CONVERTTORELFORFOCUS(loc, FOCUS);
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