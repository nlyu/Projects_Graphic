/**
* Description: define global variables for camera control.
* For the camera control, we will specified a axis for the rotation, eyepoint that     defines the
* position and a speed that controls the rotation
*/
var viewvertial = vec3.fromValues(0.0, 1.0, 0.0);
var viewhorizon = vec3.fromValues(1.0, 0.0, 0.0);  
var origEyePt = vec3.fromValues(0.0,0.0,10.0);
var rotation_speed = 0.1;

/*
* Description: read input from user to control the view
* Input: keyboard event
* Output: None
*/
function keyboard_command(event){
	//up arraw
    if (event.keyCode == 38){
        //set axis horizon
        quatRotation(rotation_speed, viewhorizon);       
        vec3.transformQuat(eyePt, origEyePt, globalQuat);
		vec3.normalize(viewDir, eyePt);
		vec3.scale(viewDir, viewDir, -1);
    }
    //down arraw
    if (event.keyCode == 40){
        //set axis horizon
        
        quatRotation(-rotation_speed, viewhorizon);       
        vec3.transformQuat(eyePt, origEyePt, globalQuat);
		vec3.normalize(viewDir, eyePt);
		vec3.scale(viewDir, viewDir, -1);
    }
    //left arraw
    if (event.keyCode == 37){
        //set axis vertical
        quatRotation(-rotation_speed, viewvertial);       
        vec3.transformQuat(eyePt, origEyePt, globalQuat);
		vec3.normalize(viewDir, eyePt);
		vec3.scale(viewDir, viewDir, -1);
    }
    //right arraw
    else if (event.keyCode == 39){
        //set axis vertical
        quatRotation(rotation_speed, viewvertial);    
        vec3.transformQuat(eyePt, origEyePt, globalQuat);
		vec3.normalize(viewDir, eyePt);
		vec3.scale(viewDir, viewDir, -1);
    }
}

