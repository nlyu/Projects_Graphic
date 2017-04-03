/*
 * Description: Set up texture for the cube and store them into the buffer
 * This function is mostly copied from hellotexture.js from course website
 * Input: None
 */
function setupSkybox() {

  // Create a buffer for the cube's vertices.
  cubeVertexBuffer = gl.createBuffer();

  // Select the cubeVerticesBuffer as the one to apply vertex
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);

  // Now create an array of vertices for the cube.
  //set to 100 due to the size needed
  var vertices = [
    //Front face
    -100.0, -100.0,  100.0,
     100.0, -100.0,  100.0,
     100.0,  100.0,  100.0,
    -100.0,  100.0,  100.0,

    //Back face
    -100.0, -100.0, -100.0,
    -100.0,  100.0, -100.0,
     100.0,  100.0, -100.0,
     100.0, -100.0, -100.0,

    //Top face
    -100.0,  100.0, -100.0,
    -100.0,  100.0,  100.0,
     100.0,  100.0,  100.0,
     100.0,  100.0, -100.0,

    //Bottom face
    -100.0, -100.0, -100.0,
     100.0, -100.0, -100.0,
     100.0, -100.0,  100.0,
    -100.0, -100.0,  100.0,

    //Right face
     100.0, -100.0, -100.0,
     100.0,  100.0, -100.0,
     100.0,  100.0,  100.0,
     100.0, -100.0,  100.0,

    //Left face
    -100.0, -100.0, -100.0,
    -100.0, -100.0,  100.0,
    -100.0,  100.0,  100.0,
    -100.0,  100.0, -100.0
  ];

  // Now pass the list of vertices into WebGL to build the shape. We
  // do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current vertex buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  cubeTriIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeTriIndexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  var cubeVertexIndices = [ 
    //front
    0,  1,  2,
    0,  2,  3, 
    //back
    4,  5,  6,
    4,  6,  7,  
    //top
    8,  9,  10, 
    8,  10, 11,
    //bottom
    12, 13, 14, 
    12, 14, 15,
    //right
    16, 17, 18,
    16, 18, 19,
    //left
    20, 21, 22, 
    20, 22, 23
  ];

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}

/* Description: Draw the skybox by binding the texture to the cube
 * This function is mainly learnt from helloTexture.js in course website
 * Input: None
 * Output: None
 */
function drawSkybox(){
    //check shader switch
	gl.uniform1f(gl.getUniformLocation(shaderProgram, "uIsSkybox"), true);
	// Draw the cube by binding the array buffer to the cube's vertices
	// array, setting attributes, and pushing it to GL.
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	// Draw the cube by binding the array buffer to the cube's vertices
	// array, setting attributes, and pushing it to GL.
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	// Specify the texture to map onto the faces.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

	// Draw the cube.
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeTriIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}