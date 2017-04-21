/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxerr: 50*/


function createAdd(result, operations){
    /**
    Asssumes result > operations
    **/
    "use strict";
    if (!operations || operations <= 0){
        return [result];
    }
    
    if (result <= 0){
        return [0, 0];
    }
    
    var leftOps = Math.floor((operations - 1) / 2 ) ;
    var rightOps = (operations - 1 - leftOps);
    
    var random = Math.round(Math.random() * result);
    var rightValue = Math.max( Math.min(random, result - leftOps - 1), rightOps + 1);
    var leftValue = result - rightValue;
    
    var left = createAdd(leftValue, leftOps);
    var right = createAdd(rightValue, rightOps);
    return  left.concat(right);
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
    var nums = createAdd(result, 2);
    return format_add(nums, false);
    
    
}

var yieldAnswer = function(equation, result){
    "use strict";
    old.innerHTML = "<p>" + (equation + " = " + result)+ "</p>" + old.innerHTML;
}

var newProblem = function(){
	"use strict";
	start = new Date().getTime();
    var result = Math.max(Math.round(Math.random() * 101), 6);
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
    
    timeLimit = 1000 * 5;
	
	newProblem();
	setInterval(refreshTimer, 100);
	setInterval(newProblem, timeLimit);
};
