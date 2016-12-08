Saving = (function(){

SAVETOFILE = function saveToFile(){
    "use strict";
    var blob = new Blob([JSON.stringify(balls)]);
    var d = new Date();
    saveAs(blob, "gravSim_"+d.getTime());
}

BALLFROMSTRING = function ballsFromString(str){
    "use strict";
    
    var tempArray = JSON.parse(str);
    if(!tempArray){
        return;
    }
    var i, b, balls = [];
    for(i=0;i<tempArray.length;i++){
        b = new Ball(tempArray[i].location.x, tempArray[i].location.y, tempArray[i].radius, tempArray[i].mass);
        b.velocity = tempArray[i].velocity;
        balls.push(b);
    }
    return balls;
}


LOADFROMFILE = function loadFromFile(){
    "use strict";
    var btn = document.getElementById('load');
    var file = btn.files[0];
    if(!file){
        return;
    }
    
    var reader = new FileReader();
    
    //runs when reader is finished loading
    reader.onload = function(e) {
        BALLFROMSTRING(e.target.result);
    };
    
    reader.readAsText(file);
}

return {
    saveToFile: SAVETOFILE,
    ballsFromString: BALLFROMSTRING,
    loadFromFile: LOADFROMFILE
    
};
}());
