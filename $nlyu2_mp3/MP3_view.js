/*
* Description: Create new rotation matrix that change the global quaternion matrix. 
* Input: the rotation speed, the rotation axis
* Side-effect: change the global variable globalQuat
* Output: None;
*/
function quatRotation(rotationRate, rotAxis){
    var tempQuat = quat.create();// create a new quaternion to apply new rotation
    quat.setAxisAngle(tempQuat, rotAxis, rotationRate);
    quat.normalize(tempQuat, tempQuat);
    //change the quaternion matrix
    quat.multiply(globalQuat, tempQuat, globalQuat);
    quat.normalize(globalQuat, globalQuat);
}
