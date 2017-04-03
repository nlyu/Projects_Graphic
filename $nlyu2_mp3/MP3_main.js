
var gl;
var canvas;
var shaderProgram;

// View parameters
var eyePt = vec3.fromValues(0.0,0.0, 10.0);
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);
var globalQuat = quat.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

// Create Projection matrix
var pMatrix = mat4.create();

// Create Normal matrix
var nMatrix = mat3.create();

var mvMatrixStack = [];

//------------------Above is copied from Discussion 5 Demo-------------------
// buffer for cubmap mesh
var cubeTCoordBuffer;

// buffer storing terrain vertex
var cubeVertexBuffer;

//buffer storing cube map triangles
var cubeTriIndexBuffer;

//buffer storing texture
var cubeImage;
var cubeTexture;

//animation 
var then =0;
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
//-------------------------------------------------------------------------
function uploadModelViewMatrixToShader() {
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
function uploadProjectionMatrixToShader() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

/**
* Function to pass the normal matrix to the shader program
* @return None
*/
function uploadNormalMatrixToShader() {
    mat3.fromMat4(nMatrix,mvMatrix);
    mat3.transpose(nMatrix,nMatrix);
    mat3.invert(nMatrix,nMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

/**
* Function to manipulate lighting information in shader for Phong Lighting Model
* @return None
*/
function uploadLightsToShader(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

//------------------no----------------------------------------------------------------
function uploadViewDirToShader(){
	gl.uniform3fv(gl.getUniformLocation(shaderProgram, "viewDir"), viewDir);
}

//------------------no----------------------------------------------------------------
function uploadRotateMatrixToShader(rotateMat){
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uRotateMat"), false, rotateMat);
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
	console.log("Vertex attrib: ", shaderProgram.vertexPositionAttribute);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
//	// Enable vertex colors
//    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
//    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	
	// Enable vertex normals
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

//--------------------Above is given by Discussion5 Demo--------------------------------------------------------------

/*
 * Description: create buffer for skybox and obj file
 * Input: None
 * Output: None
 *
 */
function setupBuffers(){
    //create skybox
    setupSkybox();
    //load obj file
	readTextFile("teapot_0.obj", setupTeapotBuffers);
    //create cube map
    setupCubeMap();
}


/*
 * Description: create buffer for the cube map. This function with load the six images
 * to the corresponding six cube faces and set the correct texture.
 * Input: None
 * Output: None
 */
function setupCubeMap() {
    //set up cub map
    cubeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture); 
	//set rendering parameters
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, 
          gl.LINEAR); 
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,    
          gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //Load up each cube map face
    loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
          cubeTexture, 'demo/canary/posx.jpg');  
    loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,    
         cubeTexture, 'demo/canary/negx.jpg');    
    loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
        cubeTexture, 'demo/canary/posy.jpg');  
    loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
       cubeTexture, 'demo/canary/negy.jpg');  
    loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
       cubeTexture, 'demo/canary/posz.jpg');  
    loadCubeMapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
       cubeTexture, 'demo/canary/negz.jpg'); 	
}



/*
 * Description: Load the image to the correct cube face. This function will be called
 * by the setCube function.
 * Input: the target image, texture, color and gl
 * Output: None
 */
function loadCubeMapFace(gl, target, texture, url){
//TODO: Onload call function
    var image = new Image(); //reserve image storage
    image.src = url; //specify where to find the image
    image.onload = function() //specifies the callback to call when image loaded
    {   
        //build simple cube map
    	gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        //define image as a texture
        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }
}



/*
 * Description: This function will process the loaded texture. It will check and
 * create the minimap for the loaded texture and will set the wrap mode for the
 * texture.
 * Input: target image and texture
 * Output: None
 */
function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
   
  var height_bool = (image.height & (image.height - 1));
  var width_bool = (image.width & (image.width - 1));
  //Pre-fitered images to avoid minification
  if (height_bool && width_bool) {
     //Generate Mipmap
     gl.generateMipmap(gl.TEXTURE_2D);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  } else {
     //Set the wrap mode to clamp to edge
     gl.texParameteri(gl.TETXURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TETXURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TETXURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  //highest quality filtering
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}


//-------------------------Below is given by Discussion5 Demo--------------------------------------
function draw() { 
    var translateVec = vec3.create();
    var scaleVec = vec3.create();
  
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix, degToRad(90), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);
 
    //Draw 
    mvPushMatrix();
	var rotateMat = mat4.create();
	mat4.rotateY(rotateMat, rotateMat, modelYRotationRadians);
	uploadRotateMatrixToShader(rotateMat);
    vec3.set(translateVec,0.0,0.0,-10.0);
    mat4.translate(mvMatrix, mvMatrix,translateVec);
    setMatrixUniforms();
	//set camera
    vec3.add(viewPt, eyePt, viewDir);
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);
	uploadLightsToShader([0,30,0],[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]);
	//skybox
    drawSkybox();
    //teapot rotation
    mat4.rotateY(mvMatrix,mvMatrix,modelYRotationRadians);
    drawTeapot();
    mvPopMatrix();
}

/*
 * Descriptioin: rotate the teapot
 * Input: None
 * Output: None
*/
function animate() {
    //get seconds
    now = Date.now() * 0.002;
    //get updated time
    then = now;  
    //add degree for rotation
    modelYRotationRadians += 0.02;
}


//----------------------------------------------------------------------------------
function startup() {
	canvas = document.getElementById("myGLCanvas");
    //create canvas
	gl = createGLContext(canvas);
    //record the keyboard event
	document.onkeydown = keyboard_command;
    //set up renders
	setupShaders();
	setupBuffers();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	tick();
}

//----------------------------------------------------------------------------------
function tick() {
    requestAnimFrame(tick);
    draw();
    //get the started time, begining of the rotation
    then = Date.now();
    animate();
}

