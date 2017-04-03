
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray,normalArray,altitude)
{
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           //push the vertex into array
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(altitude[j][i]);
       }
    
    //set normal vector
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           //setthe normal vertex
           var vid = i*(n+1) + j;
             normalArray.push(vid);
             normalArray.push(vid+(n+1));
             normalArray.push(vid+1);
       }

    var numT=0;
    //set the normal vector
    //generateNormals(altitude, normalArray, n, deltaX, deltaY);
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+n+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+1+n+1);
           faceArray.push(vid+n+1);
           numT+=2;
       }
    return numT;
}

/*
    generate a array storing color
    color data is saved in the colormap array arroding to the height
*/
function generatecolor(colormap, altitude, size){
    var i = 0;
    var j = 0;
    var k = 0
    for(var i = 0; i < size; i ++){
        for(var j = 0; j < size; j++){
            colormap.push(0);
            colormap.push(0.5);
            colormap.push(altitude[j][i]);
            colormap.push(1);
        }
    }
}


/* 
    use specific algorithm to generate the terrain gradience 
    height Array saves the height for each vertices
*/
function generateDiamondHeight(altitude, minX, minY,  maxX, maxY, step){
    //base case, end of recursion
    if(step <= 0){
        return;
    }
    //get the height for the square shape vertices
    var height1 = altitude[minX][minY];
    var height2 = altitude[minX][maxY];
    var height3 = altitude[maxX][minY];
    var height4 = altitude[maxX][maxY];
    
    //divide the recursion depth by 2 and get the number for mid point
    step = Math.floor(step/2);
    var middleX = minX+step;
    var middleY = minY+step;
    altitude[middleX][middleY] = (height1+height2+height3+height4)/4 + Math.random()*0.2;
    var height5 = altitude[middleX][middleY];

    //find the height for diamond shape four vertices
    altitude[minX][middleY] = (height1+height2 +height5)/3 +Math.random()*0.05;
    altitude[maxX][middleY] = (height3+height5 + height4)/3 +Math.random()*0.05;
    altitude[middleX][minY] = (height1+height3+height5)/3+Math.random()*0.05;
    altitude[middleX][maxY] = (height4+ height2+height5)/3+Math.random()*0.05;

    //recursion to the next four sub-plane
    generateDiamondHeight(altitude, minX, minY, middleX, middleY, step);
    generateDiamondHeight(altitude, middleX, minY, maxX, middleY, step);
    generateDiamondHeight(altitude, minX, middleY, middleX, maxY, step);
    generateDiamondHeight(altitude, middleX, middleY, maxX, maxY, step);
}


//---------------------------------------------------------
function generateLinesFromIndexedTriangles(faceArray,lineArray)
{
    numTris=faceArray.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        lineArray.push(faceArray[fid]);
        lineArray.push(faceArray[fid+1]);
        
        lineArray.push(faceArray[fid+1]);
        lineArray.push(faceArray[fid+2]);
        
        lineArray.push(faceArray[fid+2]);
        lineArray.push(faceArray[fid]);
    }
}

//set normal
function generateNormals(normalArray, n){
      for(var i=0;i<n;i++)
         for(var j=0;j<n;j++)
         {
             var vid = i*(n+1) + j;
             normalArray.push(vid);
             normalArray.push(vid+(n+1));
             normalArray.push(vid+1);
         }
}