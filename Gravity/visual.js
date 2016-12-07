/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxlen: 120, maxerr: 50*/

//render the ball
    this.render = function (context, scale, focus, timeScale, selected) {
        //s=scale, fx= focusx, fy=focusy
        context.fillStyle = ("rgb(255,255,255)");
        context.beginPath();
        var x_ = canvas.width / 2 + (this.location.x - focus.x)/scale;
        var y_ = canvas.height/2 + (this.location.y - focus.y)/scale;
        context.arc(x_,y_,this.radius/scale, 0, 2*Math.PI);
        context.fill();
    };
    
    //render the balls selected outline, and its velocity vector
    this.selected= function(scale, timeScale, focus){
        
        context.fillStyle = "hsl(180, 100%, 50%)";
        context.beginPath();
        var x_ = canvas.width/2 + (this.location.x - focus.x)/scale;
        var y_ = canvas.height/2 + (this.location.y - focus.y)/scale;
        context.arc(x_, y_,this.radius/scale + 2, 0, 2*Math.PI);
        context.fill();
        
        //draw velocity vector
        context.lineWidth = 1;
        var r = new Vector(this.velocity.x, this.velocity.y);
        r.normalize();
        r.mult(this.radius + 2);
        context.strokeStyle = "rgb(0, 255, 255)";
        context.beginPath();
        var tox = (r.x/scale + x_ + this.velocity.x * timeScale * 60/scale);
        var toy = (r.y/scale + y_ + this.velocity.y * timeScale * 60/scale);
        context.moveTo(x_, y_);
        context.lineTo(tox, toy);
        r.normalize();
        r.mult(1.2 * this.radius/scale);
        r.rotate(Math.PI + Math.PI /4);
        context.lineTo(tox + r.x, toy + r.y);
        r.rotate(-Math.PI /2);
        context.moveTo(tox, toy);
        context.lineTo(tox +r.x, toy +r.y);
        context.stroke();
        
    };





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


