/*
    when the key is pressed down, dispatch the keys to the following command
*/
document.onkeydown = function (e){
  if (e.keyCode === 65) {
    //go left
    control_module.left = true;
    control_module.right = false;
  } else if (e.keyCode === 87) {
    //go up
    control_module.up = true;
    control_module.down = false;
  } else if (e.keyCode === 68) {
    //go right
    control_module.left = false;
    control_module.right = true;
  } else if (e.keyCode === 83) {
    //go down
    control_module.up = false;
    control_module.down = true;
  } else if (e.keyCode === 81) {
    //turn left
    control_module.leftturn = true;
    control_module.rightturn = false;
  } else if (e.keyCode === 69) {
    //turn right
    control_module.leftturn = false;
    control_module.rightturn = true;
  }
}

/*
 * Trigger flight controls for navigation when arrow keys are pressed.
 *
 * @param {Event} e The keyseyup event.
 */
document.onkeyup = function (e){
  if (e.keyCode === 65) {
    //go left
    control_module.left = false;
  } else if (e.keyCode === 87) {
    //go up
    control_module.up = false;
  } else if (e.keyCode === 68) {
    //go right
    control_module.right = false;
  } else if (e.keyCode === 83) {
    //go down
    control_module.down = false;
  } else if (e.keyCode === 81) {
    //go down
    control_module.leftturn = false;
  } else if (e.keyCode === 69) {
    //go down
    control_module.rightturn = false;
  }

//set quat for up down left right turns
  if (e.keyCode === 65 || e.keyCode === 87 || e.keyCode === 68 || e.keyCode === 83 || e.keyCode === 81 || e.keyCode === 69) {
    rot = quat.create([0.0, 0.0, 0.0, 1.0]);
  }
}


function pitch(degree) {
  //convert the degree to radian using provided function
  var rad = degToRad(degree);
  //create a working quaternion object
  var workingQuat = quat.create();
  var vecTemp = vec3.create();
  vec3.cross(vecTemp, viewDir, up);

  //use quat.setAxisAngle to update workingQuat with a yaw rotation (about y axis)
  quat.setAxisAngle(workingQuat, vecTemp, rad);
 
  //normalize resulting quat and update workingquat with a rotation
  quat.normalize(workingQuat, workingQuat);
  quat.multiply(rot, rot, workingQuat);

  //normalize resulting quaternion
  quat.normalize(rot, rot);

  //update the view matrix
  vec3.transformQuat(up, up, rot);
  vec3.transformQuat(viewDir, viewDir, rot);
}

function turn(degree) {
  //convert the degree to radian using provided function
  var rad = degToRad(degree);
  //create a working quaternion object
  var workingQuat = quat.create();

  //use quat.setAxisAngle to update workingQuat with a yaw rotation (about y axis)
  quat.setAxisAngle(workingQuat, up, rad);
 
  //normalize resulting quat and update workingquat with a rotation
  quat.normalize(workingQuat, workingQuat);
  quat.multiply(rot, rot, workingQuat);

  //normalize resulting quaternion
  quat.normalize(rot, rot);

  //update the view matrix
  vec3.transformQuat(up, up, rot);
  vec3.transformQuat(viewDir, viewDir, rot);
}


function roll(degree) {
  //convert the degree to radian using provided function
  var rad = degToRad(degree);
  //create a working quaternion object
  var workingQuat = quat.create();
  //use quat.setAxisAngle to update workingQuat with a yaw rotation (about y axis)
  quat.setAxisAngle(workingQuat, viewDir, rad);

  //normalize quaternion
  quat.normalize(workingQuat, workingQuat);
  //update workingquat
  quat.multiply(rot, rot, workingQuat);

  //normalize quaternion
  quat.normalize(rot, rot);

  //update view matrix
  vec3.transformQuat(up, up, rot);
  vec3.transformQuat(viewDir, viewDir, rot);
}
