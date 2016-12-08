

/** 
Vector class, the functions that end in 2 accept 2 input vectors
*/
function Vector(xx, yy) {
    "use strict";
    
    this.x = (typeof xx === 'undefined') ? 0 : xx;
    this.y = (typeof yy === 'undefined') ? 0 : yy;
    
    //add a vector to this one
    this.add = function add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    };

    
    //subtract a vector from this vector
    this.sub = function sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
       
    };
    
    // get magnitude of this vector
    this.mag = function mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    
    // get magnitude of this vector
    this.magSq = function magSq() {
        return this.x * this.x + this.y * this.y;
    };
    
    //normalize this vector
    this.normalize = function normalize() {
        var m = this.mag();
        this.x = this.x / m;
        this.y  = this.y / m;
    };
    
    //find dot product between this and another vector
    this.dot = function dot(vector) {
        return (this.x * vector.x + this.y * vector.y);
    };
    
    //multiply this vector by a scalar
    this.mult = function mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        
    };
    
    
    //divide this vector by a scalar
    this.div = function div(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        
    };
    
    
    //rotate this vector by input angle, in radians
    this.rotate = function rotate(angle) {
        this.x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
        this.y = this.y * Math.cos(angle) + this.x * Math.sin(angle);
        
    };

}

var VECTOR = (function VECTOR() {
    "use strict";

    //Return a Vector that is the sum of vector1 and vector2
    var ADD = function add(vector1, vector2) {
        return new Vector(vector1.x + vector2.x, vector1.y + vector2.y);
    };

    
    //Return a Vector that is the difference between vector1 and vector2
    var SUB = function sub(vector1, vector2) {
        return new Vector(vector1.x - vector2.x, vector1.y - vector2.y);
        
    };

    
    //Return a Vector equal to the normalized vector
    var NORMALIZE = function normalize(vector) {
        var m = vector.mag();
        return new Vector(vector.x / m, vector.y / m);
    };
    
    //Return the dot product of vector1 and vector2
    var DOT = function dot(vector1, vector2) {
        return (vector1.x * vector2.x + vector1.y * vector2.y);
    };
    
    //Return a Vector equal to vector times scalar
    var MULT = function mult(vector, scalar) {
        return new Vector(vector.x * scalar, vector.y * scalar);
        
    };
    
    
    //Return a Vector equal to vector divided by scalar
    var DIV = function div(vector, scalar) {
        return new Vector(vector.x / scalar, vector.y / scalar);
        
    };
    
    
    //Return a Vector equal to vector rotated angle radians
    var ROTATE = function rotate(vector, angle) {
        return new Vector(vector.x * Math.cos(angle) - vector.y * Math.sin(angle), vector.y * Math.cos(angle) + vector.x * Math.sin(angle));
        
    };
    
    return {
        add: ADD,
        sub: SUB,
        normalize: NORMALIZE,
        dot: DOT,
        mult: MULT,
        div: DIV,
        rotate: ROTATE
        
    };
}());

