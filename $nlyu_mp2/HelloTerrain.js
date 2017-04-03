var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;

// Create a place to store terrain geometry
var tVertexPositionBuffer;

//Create a place to store normals for shading
var tVertexNormalBuffer;

// Create a place to store the terrain triangles
var tIndexTriBuffer;

//Create a place to store the traingle edges
var tIndexEdgeBuffer;

// View parameters
var eyePt = vec3.fromValues(0.0,0.0,0.0);
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);

//normal matrix
var nMatrix = mat3.create();

//ModelView matrix
var mvMatrix = mat4.create();

//Projection matrix
var pMatrix = mat4.create();

var mvMatrixStack = [];

//rotation
var rot = quat.create([0.0, 0.0, 0.0, 1.0]);

//saves camera location
var lastCamera = vec3.create();
lastCamera.set([0.0, 0.0, 3]);;

//struct saves important feature for camera
var Camera_feature = {
  coverEl: document.getElementById('cover'),
  contentEl: document.getElementById('content'),

  //movement
  velocity: 0.002,
  rows: 200,
  cols: 200,
}

//struct for keyboard interface
var control_module = {
  //control members
  left: false,
  right: false,
  leftturn: false,
  rightturn: false,
  up: false,
  down: false
}

//-------------------------------------------------------------------------
function setupTerrainBuffers() {
   
    var vTerrain=[];
    var fTerrain=[];
    var nTerrain=[];
    var eTerrain=[];
    var gridN= 129;
    var max = gridN-1;

    //set up 2D array for height
    var altitude = new Array(gridN);
    for(var i =0 ; i< gridN; i++){
        altitude[i]= new Array(gridN);
    }
    //initialize the four coners
    altitude[0][0] = 0;
    altitude[max][0] = 0;
    altitude[0][max] = 0;
    altitude[max][max]=0;
   
    //get the height array
    generateDiamondHeight(altitude, 0, 0, max, max, max);
   
    //set terrain
    var terrain_size = 4;
    var numT = terrainFromIteration(gridN-1, -terrain_size, terrain_size, -terrain_size, terrain_size, vTerrain, fTerrain, nTerrain,altitude);
    console.log("Generated ", numT, " triangles");
    tVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTerrain), gl.STATIC_DRAW);
    tVertexPositionBuffer.itemSize = 3;
    tVertexPositionBuffer.numItems = (gridN+1)*(gridN+1);
   
    //set normals for lighting calculations
    tVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nTerrain),
                  gl.STATIC_DRAW);
    tVertexNormalBuffer.itemSize = 3;
    tVertexNormalBuffer.numItems = (gridN+1)*(gridN+1);
   
    //set faces for the terrain
    tIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fTerrain),
                  gl.STATIC_DRAW);
    tIndexTriBuffer.itemSize = 1;
    tIndexTriBuffer.numItems = numT*3;
   
    //Setup Edges
     generateLinesFromIndexedTriangles(fTerrain,eTerrain);  
     tIndexEdgeBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexEdgeBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(eTerrain),
                  gl.STATIC_DRAW);
     tIndexEdgeBuffer.itemSize = 1;
     tIndexEdgeBuffer.numItems = eTerrain.length;   
}


function initWebGL(canvas) {
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (gl){
      // Initialize shaders and buffers.
      initShaders();
      initBuffers();

      // Enable depth testing.
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      // Fetch matrix uniforms that we can set later.
      getMatrixUniforms();

      // Establish viewport and perspective.
      gl.viewport(0, 0, canvas.width, canvas.height);
      mat4.perspective(45, canvas.width/canvas.height, 0.1, 100, pMatrix);ee
    }
  }
  catch (e){}

  if (!gl) alert(
      "Unable to initialize WebGL. Your browser may not support it.");

  return gl;
}
//-------------------------------------------------------------------------
function drawTerrain(){
 gl.polygonOffset(0,0);
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, tVertexPositionBuffer.itemSize,
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                           tVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);  
   
 //Draw
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
 gl.drawElements(gl.TRIANGLES, tIndexTriBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}

//-------------------------------------------------------------------------
function drawTerrainEdges(){
 gl.polygonOffset(1,1);
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, tVertexPositionBuffer.itemSize,
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                           tVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);  
   
 //Draw
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexEdgeBuffer);
 gl.drawElements(gl.LINES, tIndexEdgeBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}

//-------------------------------------------------------------------------
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
                      false, pMatrix);
}

//-------------------------------------------------------------------------
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

//----------------------------------------------------------------------------------
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
 
  // exit if no element got id
  if (!shaderScript) {
    return null;
  }
 
  // build up the shader source code
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

//----------------------------------------------------------------------------------
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

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
}


//-------------------------------------------------------------------------
function uploadLightsToShader(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

//-------------------------------------------------------------------------
function uploadMaterialToShader(a,d,s) {
  gl.uniform3fv(shaderProgram.uniformAmbientMatColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseMatColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularMatColorLoc, s);
}

//----------------------------------------------------------------------------------
function setupBuffers() {
    setupTerrainBuffers();
}

//----------------------------------------------------------------------------------
function draw() {
    var transformVec = vec3.create();
 
    // initialization
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

    //so create a lookat point in z direction    
    vec3.add(viewPt, eyePt, viewDir);
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);    
 
    //Draw Terrain
    mvPushMatrix();
    vec3.set(transformVec,0.0,-0.25,-5.0);
    mat4.translate(mvMatrix, mvMatrix,transformVec);
    mat4.rotateX(mvMatrix, mvMatrix, degToRad(-75));
    mat4.rotateZ(mvMatrix, mvMatrix, degToRad(25));    
    setMatrixUniforms();
   
    //set color
    var Ia = vec3.fromValues(1.0,1.0,0.0);
    var Id = vec3.fromValues(1.0,1.0,0.0);
    var Is = vec3.fromValues(1.0,1.0,0.0);
    
    var lightPosEye4 = vec4.fromValues(20.0,20.0,0.0,1.0);
    lightPosEye4 = vec4.transformMat4(lightPosEye4,lightPosEye4,mvMatrix);
    //console.log(vec4.str(lightPosEye4))
    var lightPosEye = vec3.fromValues(lightPosEye4[0],lightPosEye4[1],lightPosEye4[2]);
    
    //set material  
    var transformVec = vec3.create();
    var ka = vec3.fromValues(0.0,0.0,0.0);
    var kd = vec3.fromValues(0.6,0.6,0.0);
    var ks = vec3.fromValues(0.4,0.4,0.0);
    mvPushMatrix();
    vec3.set(transformVec,10,10,10);
    mat4.scale(mvMatrix, mvMatrix,transformVec);
    
    //send the color to shader for terrain
    if ((document.getElementById("polygon").checked) || (document.getElementById("wirepoly").checked))
    {
        uploadLightsToShader([1,1,1],[0.2,0.4,0.4],[0.0,0.7,0.25],[0.0,0.0,1.0]);
        drawTerrain();
    }
   
    if(document.getElementById("wirepoly").checked){
        uploadLightsToShader([0,1,1],[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]);
        drawTerrainEdges();
    } 
    mvPopMatrix();
}


//----------------------------------------------------------------------------------
function animate() {
   // Get the current direction.
  vec3.normalize(viewDir, viewDir);
 
  vec3.scale(viewDir, viewDir, Camera_feature.velocity);

  // Save the last camera position.
  lastCamera.set(eyePt);

  // Normalize the up vector before applying scaling.
  vec3.normalize(up, up);

  // Apply rotation transformations to the direction vector.
  if (control_module.left){
    roll(-5);
  }
  else if (control_module.right){
    roll(5);
  }

  // Detact left/right turn
  if (control_module.leftturn){
    turn(0.05);
  }
  else if (control_module.rightturn){
    turn(-0.05);
  }    
  if (control_module.up){
    pitch(3);
  }
  else if (control_module.down){
    pitch(-3);
  }

  // Update the current vector
  vec3.add(eyePt, eyePt, viewDir);
}

//----------------------------------------------------------------------------------
function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  //set the back ground
  gl.clearColor(0.0, 0.1, 0.8, 1.8);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

//----------------------------------------------------------------------------------
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}