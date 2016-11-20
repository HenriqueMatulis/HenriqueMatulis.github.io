/*jslint white: true, bitwise: true, eqeq: true, nomen: true, plusplus: true, vars: true, maxerr: 50*/

//set up canvas animation
var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {
    "use strict";
    window.setTimeout(callback, 1000 / 60); 
  };






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
    
var start;
var equation = "";
var result ;//= Math.floor(Math.random() * 1000) + 6;
var i = 0;
var dir = 1;

function setup(){
    "use strict";
    

    start = new Date().getTime() + 10;
    
    result = (i+1);
    
    var nums = createAdd(result, i);
    equation = format_add(nums, false);
    
    i+=dir;
    
    if(i >= 10){
        dir = -dir;
    }else if (i <=0){
        dir = -dir;
    }
    
}

setup();
//frame is basically a while loop or draw loop
var frame= function(){
    "use strict";
    var t = new Date().getTime();
    document.getElementById('timer').innerHTML = Math.max(Math.round((start - t) / 100) / 10, 0);
    
    if((start - t)  <= 0){
        setup();
        document.getElementById('old').innerHTML = document.getElementById('new').innerHTML + document.getElementById('old').innerHTML;
        document.getElementById('old2').innerHTML = document.getElementById('new').innerHTML + document.getElementById('old2').innerHTML;
        if (document.getElementById('old').innerHTML.length > 1500){
            document.getElementById('old').innerHTML = document.getElementById('old').innerHTML.slice(0, 1000);
            document.getElementById('old2').innerHTML = document.getElementById('old2').innerHTML.slice(0, 1000);
        }
        document.getElementById('new').innerHTML = '<p>'+ equation + " = " + result +'</p>';

    }
    
    
    animate(frame);
};



window.onload = function() {
   "use strict";
    animate(frame);
};
