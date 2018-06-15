/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxerr: 50*/

// Global vars
var timeLimit;
var new_;
var old;

var timeLimitFunc;

var start = new Date().getTime();
var timer;

window.onload = function() {
   "use strict";

	new_ = document.getElementById('new');
	old = document.getElementById('old');
	timer = document.getElementById('timer');
    
	timeLimitFunc = (result, terms) => (45 * result + 2500 * terms);
	
	question();
	setInterval(refreshTimer, 100);
};


var refreshTimer = function(){
	"use strict";
	var t = new Date().getTime();
	timer.innerHTML = "Timer: "+Math.round((timeLimit - t + start) / 100) / 10;
}


// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}


function buildQuestion(number, question){
		if(question == "" || typeof question !== "string"){
			return "" + number;
		}
	
		if(number >= 0){
			return question + " + " + number;
		} else {
			return question + " - " + (-number);
		}
}

function makeQuestion(result, amount){
	let question = "";
	let left = result;
	let arr = [];
	for(let i=0; i < amount - 1; i++){
			let mean = left / (amount - i);
			let std = mean / 2;
			let number = Math.round(std * randn_bm() + mean);
			left -= number;
			arr.push(number);
			question = buildQuestion(number, question);
	}
	
	question = buildQuestion(left, question);
	arr.push(left);
	return [question, arr];
}

function write(question_text){
	new_.innerHTML = "<p>" + (question_text)+ "</p>";
}

var yieldAnswer = function(equation, result){
    "use strict";
    old.innerHTML = "<p>" + (equation + " = " + result)+ "</p>" + old.innerHTML;
}

function question() {
   let ans = Math.floor(Math.random() * 101);
	
	let top;
	if(ans > 60) {
		top = 4;
	} else if( ans > 20){
		top = 3;
	} else {
		top = 2;
	}
	
	
	let amt = Math.floor(Math.random() * (top - 1)) + 2;
	let r = makeQuestion(ans, amt);
	
    timeLimit = timeLimitFunc(ans, amt);
	write(r[0]);
	
	start = new Date().getTime();
	
	setTimeout( () => yieldAnswer(r[0], ans), timeLimit);
	setTimeout(question, timeLimit);
	refreshTimer();
}


