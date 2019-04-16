## Library: MarchingSquaresJS

Sourced from [sakri/MarchingSquaresJS](https://github.com/sakri/MarchingSquaresJS)  
License: MIT

### What is it?

Implementation of the Marching Squares algorithm in javascript for Html5 Canvas

### What do we use it for?

During Map generation, TerrainVer outputs an image of map 'blobs'. To convert these blobs into vertices of a polygon, the Marching Squares algorithm is used. The algorithm 'marches' along the edges of the image and outputs a list of vertices.  

The result of the Marching Squares algorithm is then fed to the SnoeyinkKeil algorithm from hxGeomAlgo. This reduces the single large polygon output into many smaller polygons for Box2D.

### Changes to the source

In rare occassions, the walkPerimeter function would result in an infinite loop. The function was modified to throw an error after an excessive number of iterations.