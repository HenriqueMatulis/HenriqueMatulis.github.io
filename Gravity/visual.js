Visual = (function(){
    
//render the balls selected outline, and its velocity vector
    function selected(ball, context, scale, focus, timeScale){
        
        context.fillStyle = "hsl(180, 100%, 50%)";
        //draw outline
        context.beginPath();
        var pos = CONVERTTOREL(canvas, ball.location, scale, focus);
        context.arc(pos.x, pos.y,this.radius/scale + 2, 0, 2*Math.PI);
        context.fill();
        
        //draw velocity vector here!
        context.lineWidth = 1;
        var r = new Vector(this.velocity.x, this.velocity.y);
        r.normalize();
        r.mult((ball.radius + 2) / scale);
        context.strokeStyle = "rgb(0, 255, 255)";
        context.beginPath();
        
        var to = VECTOR.add(pos, r);
        to.add(VECTOR.mult(this.velocity, timeScale * 60 / scale));
        
        //line from center of sphere to velocity
        context.moveTo(pos.x, pos.y);
        context.lineTo(to.x, to.y);
        
        //line from where tip of arrow to down-left
        r.mult(1.2);
        r.rotate(Math.PI + Math.PI / 4);
        context.lineTo(to.x + r.x, to.y + r.y);
        
        //line from tip of arrow to down-right
        context.moveTo(to.x, to.y);
        r.rotate(-Math.PI /2);
        context.lineTo(to.x + r.x, to.y + r.y);
        context.stroke();
        
    };
    
    
//render the ball
    var RENDER = function render(ball, context, scale, focus, timeScale, selected) {
        //s=scale, fx= focusx, fy=focusy
        if(selected){
            selected(ball, context, scale, focus, timeScale);
        }
        
        //draw ball
        context.fillStyle = ("rgb(255,255,255)");
        context.beginPath();
        
        var pos = CONVERTTOREL(canvas, ball.location, scale, focus);
        context.arc(pos.x, pos.y, ball.radius / scale, 0, 2*Math.PI);
        context.fill();
    };
    
    
    //convert user's relative co-ordinate system to the absolute cordinate system
    var CONVERTTOABS = function convertToAbs(canvas, loc, scale, focus){
        "use strict";
        var l = new Vector((loc.x - canvas.width/2)*scale, (loc.y - canvas.height/2)*scale);
        l.add(focus);
        return l;
    }

    
    //convert from absolute to relative co-ordinate system
    var CONVERTTOREL = function convertToRel(canvas, loc, scale, focus){
        "use strict";
        var l = new Vector(canvas.width/2 + (loc.x - focus.x)/scale, canvas.height/2 + (loc.y - focus.y)/scale);
        return l;
    }
    
    
    return {
        render: RENDER,
        convertToAbs: CONVERTTOABS,
        convertToRel: CONVERTTOREL
    };

}());