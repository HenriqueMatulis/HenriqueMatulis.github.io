/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxerr: 50*/


function createAdd(result, operations){
    "use strict";
    if (operations <= 0 || !operations){
        return [result];
    }
    
    if (result <= 0){
        return [0, 0];
    }
    
    var aOps = Math.floor(Math.random() * (operations));
    var bOps = (operations - aOps);
    var diff = result - bOps;
    
    var a = 1 + aOps + Math.floor(Math.random() * (diff - 1 - aOps));
    var b = result - a;
    var c = createAdd(a, aOps);
    var d = createAdd(b, bOps - 1);
    return  c.concat(d);
}

function format_add(strs, strict){
    "use strict";
    if(strs.length == 1){
        return strs[0];
    }
    if(strs.length > 2){
        return (strict?"(":"") + strs[0] + " + " + strs[1] + ' + ' + format_add(strs.slice(2), false) + (strict?")":"");
    }
    return (strict?"(":"") + strs[0] + " + " + strs[1] + (strict?")":"");
    
}

var equation = "";
var result ;//= Math.floor(Math.random() * 1000) + 6;
var i = 0;
var dir = 1;
var timeLimit = 1150;
var animDuration = Math.min(timeLimit - 20, 750);

var bufferToNew;
var bufferToOld;

var new_;
var old;

var timer;

var start = new Date().getTime();




function makeProblem(){
    "use strict";
    
    
    result = (i+1) * 10;
    
    var nums = createAdd(result, i);
    equation = format_add(nums, false);
    
    i+=dir;
    
    if(i >= 10){
        dir = -dir;
    }else if (i <=0){
        dir = -dir;
    }
    
}


var startBuffers = function(){
	bufferToNew.innerHTML = '<p>'+ equation + " = ??? </p>";
	bufferToOld.innerHTML = new_.innerHTML;
	
	document.body.appendChild(bufferToNew);
	document.body.appendChild(bufferToOld);
    
}

var clearBuffers = function(){
	old.innerHTML = bufferToOld.innerHTML + old.innerHTML;
	new_.innerHTML = bufferToNew.innerHTML;
     if (old.innerHTML.length > 1500){
		old.innerHTML = old.innerHTML.slice(0, 1000);
     }
	bufferToNew.remove();
	bufferToOld.remove();
}

var clearNew = function(){
	new_.innerHTML = "";
}

var newProblem = function(){
	"use strict";
	start = new Date().getTime();
	makeProblem();
	startBuffers();
	clearNew();
	setTimeout(clearBuffers, animDuration);
}

var refreshTimer = function(){
	"use strict";
	var t = new Date().getTime();
	timer.innerHTML = Math.round((timeLimit - t + start) / 100) / 10;
	
	
}








window.onload = function() {
   "use strict";
    bufferToNew = document.getElementById('bufferToNew');
	bufferToOld = document.getElementById('bufferToOld');
	bufferToNew.style.animationDuration = animDuration/1000 + "s";
	bufferToOld.style.animationDuration = animDuration/1000 + "s";
	bufferToOld.remove();
	bufferToNew.remove();

	new_ = document.getElementById('new');
	old = document.getElementById('old');
	
	timer = document.getElementById('timer');
	
	
	setInterval(refreshTimer, 100);
	setInterval(newProblem, timeLimit);
};
