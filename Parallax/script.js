let cvs = document.getElementById("mainCanvas");
cvs.height = window.innerHeight;
cvs.width = window.innerWidth;
let ctx = cvs.getContext('2d');

// Make the star image
var starCvs = document.getElementById("starImage");
starCvs.height = starCvs.width = 200;

var starCtx = starCvs.getContext('2d');

function setStarColor(r, g, b, magn=5000){
	let starData = starCtx.createImageData(starCvs.width, starCvs.height); 
	for(let i=0; i < starData.height * starData.width; i++){
		let x = i % starData.width;
		let y = (i - x) / starData.width;
		let dist = Math.pow(Math.pow(x - starData.width/2, 2) + Math.pow(y - starData.height/2, 2), 0.5);
		let cappedDist = dist;

		if(cappedDist <= 1){
			cappedDist = Math.pow(magn / 255, 0.5);
		}
		let intensity = magn / cappedDist / cappedDist;
		for(let j=0; j < 2; j++){
		  starData.data[4*i + j] = 255;
		}
		starData.data[4*i + 0] = r;
		starData.data[4*i + 1] = g;
		starData.data[4*i + 2] = b;
		starData.data[4*i + 3] = intensity;
	  
	}
	starCtx.putImageData(starData, 0, 0);
}

setStarColor(255, 255, 100, 5000);


var audioCtx = new AudioContext();
var analyser = false;
var soundData = false;;
navigator.mediaDevices.getUserMedia ({audio: true}).then(
  function(stream) {
	analyser =  audioCtx.createAnalyser()
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
	soundData = new Uint8Array(analyser.frequencyBinCount)
	
  });

var maxDb = 15;

function getAverageAmplitude(freqToAmp, lowFrequency=-Infinity, highFrequency=Infinity){
	let absSum = 0;
	let length = 0;
	for(var i = 0; i < freqToAmp.length; i++) {
		let freq = i * audioCtx.sampleRate / analyser.fftSize;
		let magnitude = freqToAmp[i];

		if(magnitude < 0){
			magnitude *= -1;
		}
		
		if(lowFrequency <= freq && freq <= highFrequency){
			absSum += magnitude;
			length++;
		}
	}
	return absSum / length;
}

function showFreqtoAmp(freqToAmp){
	let scale = 10;
	let boxWidth = cvs.width / freqToAmp.length * scale;
	for(var i = 0; i < freqToAmp.length / scale; i++) {
		let xLeft = (boxWidth + 1) * i;
		let boxHeight = cvs.height * freqToAmp[i] / 255 / 2;
		let yTop = cvs.height - boxHeight;
		
		let freq = i * audioCtx.sampleRate / analyser.fftSize;
		if(250 < freq && freq < 500){
			ctx.fillStyle = 'rgba(0, 255, 0 , 1)';
		} else {
			ctx.fillStyle = 'rgba(255, 0, 0 , 1)';
		}
		ctx.fillRect(xLeft, yTop, boxWidth, boxHeight);
	}
	
}

var maxDb = 1;
var maxBassDb = 1;
function visualizeSound(){
	if(analyser == false){
		return;
	}
	analyser.getByteFrequencyData(soundData);

	
	let db = getAverageAmplitude(soundData);
	let bassDb = getAverageAmplitude(soundData, 250, 500);
	maxDb = maxDb > db ? maxDb : db;
	maxBassDb = maxBassDb > bassDb ? maxBassDb : bassDb;

	showFreqtoAmp(soundData);
	let bassNorm = bassDb / maxBassDb;
	let volumeNorm =  db / maxDb;
	//ctx.fillStyle = 'rgba(0, 255, 0 , 1)';
	//ctx.fillText("Current " + bassDb, 10, 10);
	//ctx.fillText("Max: " + maxBassDb, 10, 25);
	//ctx.fillText("Normed: " + bassNorm, 10, 40);
	
	setStarColor(255, 255 -255 * bassNorm, 255 - 255 * bassNorm, 15000 * volumeNorm);	

}


let frameFunction = x => setInterval(x, 1000 / 60);




var topSide = 1 / 5;
var botSide = 3;
var botSpeed = 5;
var topSpeed = 1 / 20;

var decreaseFactor = (botSide - topSide) / cvs.height;
var speedFactor = (botSpeed - topSpeed) / cvs.height;

class Square {
  constructor() {
    this.restart();
  }
  
  draw(){

	
	// Draw the colored image
	let ds = starCvs.width * this.side();
	let dx = this.x - ds/2;
	let dy = this.y - ds/2;
	ctx.drawImage(starCvs, dx, dy, ds, ds);

	ctx.globalCompositeOperation = "source-over";
	

 
  }
  
  
  
  restart(){
    if(removeNextSquare){
      squares.splice(squares.indexOf(this), 1)
	  return;
    }
    // Position
    this.x = - topSide - botSide;
    
    this.y = Math.random() * cvs.height;
    
    // Speed loc
    this.distance = random(4) * cvs.height;
    
    // New speed
    this.speed = () => (this.distance * speedFactor + topSpeed);
    
    // New side
    this.side = () => (this.distance * decreaseFactor + topSide);
    
    // New color
    this.r = 255;
    this.g = 255 - 100 * random(2);
    this.b = 100 - random(2) * 100;
	this.a = 255;
  }
  

  update(){
    this.x += this.speed();
    if(this.x > cvs.width + 20){
      this.restart();
    }
  }
}

function random(n){
  let tally = 0;
  for(let i=0; i < n; i++){
    tally += Math.random();
    
    
  }
  tally *= 2 / n;
  tally = tally > 1 ? 2 - tally : tally;
  tally = 1 - tally;
  return tally;
}


function clear(){
    ctx.fillStyle = 'rgba(0, 0, 0 , 1)';
    ctx.fillRect(-1, -1, cvs.width + 1, 1 + cvs.height);
}

function line(fromX, fromY, toX, toY, color="rgba(133,133,133, 1)"){
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}

function ground(){
  let halfWay = cvs.width / 2;
  for(let i = 0; i * topSide < cvs.width || i * botSide < cvs.width; i++){
    for(let sign = -1; sign <= 1; sign+= 1){ 
      let xTop = sign * i * topSide + halfWay;
      let xBot = sign * i * botSide + halfWay;
      line(xTop, 0, xBot, cvs.height);
    }
  }
}

function addRandomSquare(){
 
  let y = Math.random() * cvs.height;
  squares.push(new Square());
}




let squares = [];
var desiredLength = 700;
var frameCount = 0;
var removeNextSquare = false;
function draw(){
  frameCount++
  clear();
  //ground();
  
  removeNextSquare = false;
  if(squares.length < desiredLength){
    addRandomSquare();
  } else if(squares.length > desiredLength){
    removeNextSquare = true;
  }
  
  
  for(let i=squares.length - 1; i >= 0; i--){
    let square = squares[i];
    square.draw();
    square.update();
  }
  visualizeSound();
}


frameFunction(draw);