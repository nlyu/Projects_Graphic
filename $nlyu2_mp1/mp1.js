var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;


// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create();//create the matrix that saves the badge picture
var rotAngle = 0; //rotation degree that control the rotation
var lastTime = 0; //counter that saves the time


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//this function will transfer degree to angle
function degToRad(degrees) {
        return degrees * Math.PI / 180; //transfrom degree to ra
}

//this function will draw the background
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

//This function will set up the vertices of the picture. This picuture is a illinois badge. 
//We will use 90 vertices to construct this picture.
function setupBuffers() {//set up the picture
  vertexPositionBuffer = gl.createBuffer(); //set up the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  var triangleVertices = [//matrix of 30 triangles consists of 90 vertices
      
      //below lists 30 triangles
      //the first 20 triangles is the "I" part
          -0.95, 0.95, 0.0,//1
      0.95,  0.95,  0.0,
      -0.95,  0.63,  0.0,
          
      -0.95,  0.63,  0.0,//2
      0.95,  0.95,  0.0,
      -0.75,  0.63,  0.0,
          
      -0.75,  0.63,  0.0,//3
      0.95,   0.95,  0.0,
      -0.35,  0.63,  0.0,
      
       -0.35,   0.63,  0.0,//4
      0.95,   0.95,  0.0,
      0.35,   0.63,  0.0,
           
      0.35,   0.63,  0.0,//5
      0.95,   0.95,   0.0,
      0.75,   0.63,   0.0,
          
      0.75,  0.63,  0.0,//6
      0.95,  0.95,  0.0,
      0.95,  0.63,  0.0,
      
       -0.75, 0.63, 0.0,//7
      -0.35, 0.63, 0.0,
      -0.75, -0.3, 0.0,
      
      -0.75, -0.3, 0.0,//8
      -0.35, 0.63, 0.0,
      -0.35, 0.368, 0.0,
      
      -0.75, -0.3, 0.0,//9
      -0.35, 0.368, 0.0,
      -0.35, -0.05, 0.0,
      
       -0.35, -0.05, 0.0,//10
      -0.35, 0.368, 0.0,
      -0.2, -0.05, 0.0,
      
      -0.2, -0.05, 0.0,//11
      -0.35, 0.368, 0.0,
      -0.2,  0.368, 0.0,
      
       -0.75, -0.3, 0.0,//12
      -0.35, -0.05, 0.0,
      -0.35, -0.3, 0.0,
      
      0.2, -0.05, 0.0,//13
      0.35, 0.368, 0.0,
      0.2,  0.368, 0.0,
      
      0.35, -0.05, 0.0,//14
      0.35, 0.368, 0.0,
      0.2, -0.05, 0.0,
      
      0.75, -0.3, 0.0,//15
      0.35, 0.368, 0.0,
      0.35, -0.05, 0.0,
      
        0.75, -0.3, 0.0,//16
      0.35, 0.63, 0.0,
      0.35, 0.368, 0.0,
      
      0.75, 0.63, 0.0,//17
      0.35, 0.63, 0.0,
      0.75, -0.3, 0.0,
      
      0.75, -0.3, 0.0,//18
      0.35, -0.05, 0.0,
      0.35, -0.3, 0.0,
      
      //the below 10 parts is the organle part of the badge
      -0.75, -0.4, 0.0,//19
      -0.75, -0.45, 0.0,
      -0.6, -0.57, 0.0,
      
      -0.6, -0.57, 0.0,//20
      -0.75, -0.4, 0.0,
      -0.6, -0.4, 0.0,
      
      -0.5, -0.4, 0.0,//21
      -0.5, -0.67, 0.0,
      -0.35, -0.75, 0.0,
      
      -0.35, -0.75, 0.0,//22
      -0.5, -0.4, 0.0,
      -0.35, -0.4, 0.0,
      
      -0.2, -0.4, 0.0,//23
      -0.2, -0.8, 0.0,
      -0.05, -0.9, 0.0,
      
      -0.05, -0.9, 0.0,//24
      -0.2, -0.4, 0.0,
      -0.05, -0.4, 0.0,
      
      0.05, -0.9, 0.0, //25
      0.2, -0.4, 0.0,
      0.05, -0.4, 0.0,
      
      0.2, -0.4, 0.0,//26
      0.2, -0.8, 0.0,
      0.05, -0.9, 0.0,
      
      0.35, -0.75, 0.0,//27
      0.5, -0.4, 0.0, 
      0.35, -0.4, 0.0,
      
      0.5, -0.4, 0.0, //28
      0.5, -0.67, 0.0, 
      0.35, -0.75, 0.0, 
      
      0.6, -0.57, 0.0, //29
      0.75, -0.4, 0.0, 
      0.6, -0.4, 0.0,
      
      0.75, -0.4, 0.0, //30
      0.75, -0.45, 0.0,
      0.6, -0.57, 0.0,
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;//each vertices has size three: x,y,z
  vertexPositionBuffer.numberOfItems = 90;//there are 90 vertices in this buffer
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [//set up the color vertices
        0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
        0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      
      0.0, 0.0, 0.7, 1.0, //blue
        0.0, 0.0, 0.7, 1.0,
        0.0, 0.0, 0.7, 1.0,
      //below are 12 organges
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
       1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
       1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
       1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
       1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
       1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
      1.0, 0.0, 0.0,1.0,
      1.0, 0.0,0.0, 1.0,
      1.0, 0.0,0.0,1.0,
      
      1.0, 0.0, 0.0,1.0,
      1.0, 0.0,0.0, 1.0,
      1.0, 0.0,0.0,1.0,
      
       1.0, 0.0, 0.0,1.0,
      1.0, 0.0,0.0, 1.0,
      1.0, 0.0,0.0,1.0,
      
       1.0, 0.0, 0.0,1.0,
      1.0, 0.0,0.0, 1.0,
      1.0, 0.0,0.0,1.0,
      
       1.0, 0.0, 0.0,1.0,
      1.0, 0.0,0.0, 1.0,
      1.0, 0.0,0.0,1.0,
      
      1.0, 0.0, 0.0,1.0,
      1.0, 0.0,0.0, 1.0,
      1.0, 0.0,0.0,1.0,
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;//the item size is 4 including R,G,B and alpha
  vertexColorBuffer.numItems = 90;  //there are 90 color vertices
}

function draw() { //the draw function will set up the matrix, do the rotation and saves the buffer
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
  mat4.identity(mvMatrix);//this is the matrix that saves the illini badge
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle));//rotate the picutre along the x axis.  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

var sinscalar = 0;//variable for sin(), it will keep increment
function animate() {//animation is the function that create the wiggle action for the lower part of the picture
        sinscalar += 0.1;//increment
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        var triangleVertices = [//vertices that discrible the movement for the picture
        //the first 18 vertices does not move
        -0.95, 0.95, 0.0,//1
      0.95,  0.95,  0.0,
      -0.95,  0.63,  0.0,
          
      -0.95,  0.63,  0.0,//2
      0.95,  0.95,  0.0,
      -0.75,  0.63,  0.0,
          
      -0.75,  0.63,  0.0,//3
      0.95,   0.95,  0.0,
      -0.35,  0.63,  0.0,
      
       -0.35,   0.63,  0.0,//4
      0.95,   0.95,  0.0,
      0.35,   0.63,  0.0,
           
      0.35,   0.63,  0.0,//5
      0.95,   0.95,   0.0,
      0.75,   0.63,   0.0,
          
      0.75,  0.63,  0.0,//6
      0.95,  0.95,  0.0,
      0.95,  0.63,  0.0,
      
       -0.75, 0.63, 0.0,//7
      -0.35, 0.63, 0.0,
      -0.75, -0.3, 0.0,
      
      -0.75, -0.3, 0.0,//8
      -0.35, 0.63, 0.0,
      -0.35, 0.368, 0.0,
      
      -0.75, -0.3, 0.0,//9
      -0.35, 0.368, 0.0,
      -0.35, -0.05, 0.0,
      
       -0.35, -0.05, 0.0,//10
      -0.35, 0.368, 0.0,
      -0.2, -0.05, 0.0,
      
      -0.2, -0.05, 0.0,//11
      -0.35, 0.368, 0.0,
      -0.2,  0.368, 0.0,
      
       -0.75, -0.3, 0.0,//12
      -0.35, -0.05, 0.0,
      -0.35, -0.3, 0.0,
      
      0.2, -0.05, 0.0,//13
      0.35, 0.368, 0.0,
      0.2,  0.368, 0.0,
      
      0.35, -0.05, 0.0,//14
      0.35, 0.368, 0.0,
      0.2, -0.05, 0.0,
      
      0.75, -0.3, 0.0,//15
      0.35, 0.368, 0.0,
      0.35, -0.05, 0.0,
      
        0.75, -0.3, 0.0,//16
      0.35, 0.63, 0.0,
      0.35, 0.368, 0.0,
      
      0.75, 0.63, 0.0,//17
      0.35, 0.63, 0.0,
      0.75, -0.3, 0.0,
      
      0.75, -0.3, 0.0,//18
      0.35, -0.05, 0.0,
      0.35, -0.3, 0.0,
      
      //the next 12 vertices will move
      -0.75+Math.sin(sinscalar-0.2)*0.03, -0.4+Math.sin(sinscalar-0.2)*0.03, 0.0,
      -0.75+Math.sin(sinscalar-0.2)*0.03, -0.45+Math.sin(sinscalar-0.2)*0.03, 0.0,
      -0.6+Math.sin(sinscalar-0.2)*0.03, -0.57+Math.sin(sinscalar-0.2)*0.03, 0.0,
      
      -0.6+Math.sin(sinscalar-0.2)*0.03, -0.57+Math.sin(sinscalar-0.2)*0.03, 0.0,
      -0.75+Math.sin(sinscalar-0.2)*0.03, -0.4+Math.sin(sinscalar-0.2)*0.03, 0.0,
      -0.6+Math.sin(sinscalar-0.2)*0.03, -0.4+Math.sin(sinscalar-0.2)*0.03, 0.0,
      
      -0.5, -0.4+Math.sin(sinscalar-0.2)*0.04, 0.0,
      -0.5, -0.67+Math.sin(sinscalar-0.2)*0.04, 0.0,
      -0.35, -0.75+Math.sin(sinscalar-0.2)*0.04, 0.0,
      
      -0.35, -0.75+Math.sin(sinscalar-0.2)*0.04, 0.0,
      -0.5, -0.4+Math.sin(sinscalar-0.2)*0.04, 0.0,
      -0.35, -0.4+Math.sin(sinscalar-0.2)*0.04, 0.0,
      
      -0.2+Math.sin(sinscalar-0.2)*0.02, -0.4+Math.sin(sinscalar-0.2)*0.06, 0.0,
      -0.2+Math.sin(sinscalar-0.2)*0.02, -0.8+Math.sin(sinscalar-0.2)*0.06, 0.0,
      -0.05+Math.sin(sinscalar-0.2)*0.02, -0.9+Math.sin(sinscalar-0.2)*0.06, 0.0,
      
      -0.05+Math.sin(sinscalar-0.2)*0.02, -0.9+Math.sin(sinscalar-0.2)*0.06, 0.0,
      -0.2+Math.sin(sinscalar-0.2)*0.02, -0.4+Math.sin(sinscalar-0.2)*0.06, 0.0,
      -0.05+Math.sin(sinscalar-0.2)*0.02, -0.4+Math.sin(sinscalar-0.2)*0.06, 0.0,
      
      0.05, -0.9+Math.sin(sinscalar-0.2)*0.02, 0.0, //symmetry
      0.2, -0.4+Math.sin(sinscalar-0.2)*0.02, 0.0,
      0.05, -0.4+Math.sin(sinscalar-0.2)*0.02, 0.0,
      
      0.2, -0.4+Math.sin(sinscalar-0.2)*0.02, 0.0,
      0.2, -0.8+Math.sin(sinscalar-0.2)*0.02, 0.0,
      0.05, -0.9+Math.sin(sinscalar-0.2)*0.02, 0.0,
      
      0.35+Math.sin(sinscalar-0.2)*0.02, -0.75+Math.sin(sinscalar-0.2)*0.06, 0.0, 
      0.5+Math.sin(sinscalar-0.2)*0.02, -0.4+Math.sin(sinscalar-0.2)*0.06, 0.0, 
      0.35+Math.sin(sinscalar-0.2)*0.02, -0.4+Math.sin(sinscalar-0.2)*0.06, 0.0,
      
      0.5+Math.sin(sinscalar-0.2)*0.02, -0.4+Math.sin(sinscalar-0.2)*0.06, 0.0, 
      0.5+Math.sin(sinscalar-0.2)*0.02, -0.67+Math.sin(sinscalar-0.2)*0.06, 0.0, 
      0.35+Math.sin(sinscalar-0.2)*0.02, -0.75+Math.sin(sinscalar-0.2)*0.06, 0.0, 
      
      0.6+Math.sin(sinscalar-0.2)*0.03, -0.57+Math.sin(sinscalar-0.2)*0.01, 0.0, 
      0.75+Math.sin(sinscalar-0.2)*0.03, -0.4+Math.sin(sinscalar-0.2)*0.01, 0.0, 
      0.6+Math.sin(sinscalar-0.2)*0.03, -0.4+Math.sin(sinscalar-0.2)*0.01, 0.0,
      
      0.75+Math.sin(sinscalar-0.2)*0.03, -0.4+Math.sin(sinscalar-0.2)*0.01, 0.0, 
      0.75+Math.sin(sinscalar-0.2)*0.03, -0.45+Math.sin(sinscalar-0.2)*0.01, 0.0,
      0.6+Math.sin(sinscalar-0.2)*0.03, -0.57+Math.sin(sinscalar-0.2)*0.01, 0.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
        vertexPositionBuffer.itemSize = 3;
        vertexPositionBuffer.numberOfItems = 90;
   
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow
-       lastTime;
        rotAngle= (rotAngle+1.0) % 360;
        }
    lastTime = timeNow;
    
}

function startup() {//initiate all variables
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

function tick() {//this function is a clock
    requestAnimFrame(tick);
    draw();
    animate();
}
