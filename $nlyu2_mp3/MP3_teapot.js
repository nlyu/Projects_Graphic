//buffers for teapot model and normal vector
var teapotVertexBuffer;
var teapotVertexNormalBuffer;
var teapotTriIndexBuffer;
var normals = [];


/*
*  Description: This function will set up the teapot model. It will takes the data
*  the has already extracted from the obj file and stores the vertices for the teapot
*  into the buffer.
*  Input: text file from the obj that contains the vertices of the teapot model
*  Output: None
*/
function setupTeapotBuffers(raw_file_text){
    //teapot model buffer
	var vertices = [];
	var faces = [];
    //counter
	count_vertices = 0;
    count_faces = 0;
	//read vertex data line by line
	var lines = raw_file_text.split("\n");
    //sparse the file
	for (var line_num in lines){
		list_elements = lines[line_num].split(' ');
		if (list_elements[0] == 'v'){
            //cast to float
			vertices.push(parseFloat(list_elements[1]));
			vertices.push(parseFloat(list_elements[2]));
			vertices.push(parseFloat(list_elements[3]));
			count_vertices += 1;
		}
		else if(list_elements[0] == 'f'){
            //cast to int
			faces.push(parseInt(list_elements[2])-1);
			faces.push(parseInt(list_elements[3])-1);
			faces.push(parseInt(list_elements[4])-1);
			count_faces += 1;
		}
	}
	// bind vertex data
	teapotVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	teapotVertexBuffer.numItems = count_vertices;
    //generate normal vector for the teapot surface
    getNormals(vertices, faces, count_faces, count_vertices);
	//bind normal vector
	teapotVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    teapotVertexNormalBuffer.itemSize = 3;
    teapotVertexNormalBuffer.numItems = count_faces;
	//bind face buffer
    teapotTriIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotTriIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
	teapotTriIndexBuffer.numItems = count_faces;
}


/*
*  Description: Draw the teapot to the screen. This function will render the teapot
*  and pass the buffer to the vertex shader.
*  Input: None
*  Output: None
*/
function drawTeapot(){
    //check shader switch
	gl.uniform1f(gl.getUniformLocation(shaderProgram, "uIsSkybox"), false);
	uploadViewDirToShader()
	
	// binding the array buffer to the cube's vertices
	// array, setting attributes, finally push to GL and draw.
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);  

	// Draw the cube.
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotTriIndexBuffer);
	setMatrixUniforms();
    //6768 is the element size for the teapot
	gl.drawElements(gl.TRIANGLES, 6768, gl.UNSIGNED_SHORT, 0);
}

/*
*  Description: This function calculates the vertex normals. Using the averaging of 
*  surface normals of each face.
*  Input: Vertices Array that contains the x,y,z coordinates of each vertex
*         Index Array that contains the index of triangle faces
*         Number of triangles in the model
*         Number of verticies in the model
*         Normal Array that contains the X,Y,Z components of normal vector for each faces
*  Output: None
*/
function getNormals(vertices, faces, numT, numV){ 
    //local variables
    var v1,v2,v3;
    //initialization, count array takes the sum of normal vectors for each triangle faces
    var count = [];
    //initialze the normal vector array, this saves our final result
    for (var i=0; i < count_vertices; i++){
		normals.push(0);
		normals.push(0);
		normals.push(0);
	}
    
    //buffer that saves the normal vector for each triangle
    var faceNormals = [];  
    //create normals for each triangle faces by averaging the normals
    for (var i = 0; i < numT; i++){
        //normal vector for the triangle
        var normal = vec3.create();
        //get vertex
        v1 = faces[i*3];
        v2 = faces[i*3 + 1];
        v3 = faces[i*3 + 2];
        
        //generate two vectors and calculate the normal vector for these two vectors
        var vector1 = vec3.fromValues(vertices[3*v2]-vertices[3*v1], vertices[3*v2+1]-vertices[3*v1+1], vertices[3*v2+2]-vertices[3*v1+2]);
        var vector2 = vec3.fromValues(vertices[3*v3]-vertices[3*v1], vertices[3*v3+1]-vertices[3*v1+1], vertices[3*v3+2]-vertices[3*v1+2]);
        //do cross product to calculate the normal vector
        vec3.cross(normal, vector1, vector2);
        //saves the normal vector inthe normal vector array
        faceNormals.push(normal[0]);
        faceNormals.push(normal[1]);
        faceNormals.push(normal[2]);
        //initialization
        count.push(0);
    }
	      
    //calculate sum of the surface normal vectors
    for (var i = 0; i < numT; i++){
        v1 = faces[i*3]
        v2 = faces[i*3 + 1]
        v3 = faces[i*3 + 2]
        
        // vertex 0
        normals[3*v1 + 0] += faceNormals[i*3 + 0];
        normals[3*v1 + 1] += faceNormals[i*3 + 1];
        normals[3*v1 + 2] += faceNormals[i*3 + 2];
        
        //vertex 1
        normals[3*v2 + 0] += faceNormals[i*3 + 0];
        normals[3*v2 + 1] += faceNormals[i*3 + 1];
        normals[3*v2 + 2] += faceNormals[i*3 + 2];
        
        //vertex 2
        normals[3*v3 + 0] += faceNormals[i*3 + 0];
        normals[3*v3 + 1] += faceNormals[i*3 + 1];
        normals[3*v3 + 2] += faceNormals[i*3 + 2];
        
        //record the triangle number
        count[v1] += 1
        count[v2] += 1
        count[v3] += 1
    }
	    
    // average and normalize each normal vector in Normal array
    for (var i = 0; i < numV; i++){
        for(var j = 0; j < 3; j++){
        // averaging
            normals[3*i+j] /= count[i];
        }
        //normalization
        var normal = vec3.fromValues(normals[i*3+0], normals[i*3+1], normals[i*3+2]);
        var normalized = vec3.create();
        vec3.normalize(normalized, normal);
        for(var j = 0; j < 3; j++){
        //stored the final result
            normals[i*3+j] = normalized[j];
        }
    }
}