/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxerr: 50*/


function createAdd(result, operations){
    "use strict";
    if (!operations || operations <= 0){
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


// Global vars
var timeLimit;
var new_;
var old;
var timer;
var start = new Date().getTime();




function makeProblem(result){
    "use strict";
    var nums = createAdd(result, Math.round(1 + Math.random() * 2));
    return format_add(nums, false);
    
    
}

var yieldAnswer = function(equation, result){
    "use strict";
    old.innerHTML = "<p>" + (equation + " = " + result)+ "</p>" + old.innerHTML;
}

var newProblem = function(){
	"use strict";
	start = new Date().getTime();
    var result = Math.max(Math.round(Math.random() * 101), 4);
	var equation = makeProblem(result);
    new_.innerHTML = "<p>" + (equation + " = ???")+ "</p>";
    setTimeout(function() {
    yieldAnswer(equation, result);
}, timeLimit);
    
}

var refreshTimer = function(){
	"use strict";
	var t = new Date().getTime();
	timer.innerHTML = "Timer: "+Math.round((timeLimit - t + start) / 100) / 10;
	
	
}








window.onload = function() {
   "use strict";


	new_ = document.getElementById('new');
	old = document.getElementById('old');
	timer = document.getElementById('timer');
    
    timeLimit = 6 * 1000;
	
	newProblem();
	setInterval(refreshTimer, 100);
	setInterval(newProblem, timeLimit);
};
