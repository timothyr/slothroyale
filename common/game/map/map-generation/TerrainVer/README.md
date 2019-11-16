## Library: TerrainVer

Sourced from [juliango202/TerrainVer](https://github.com/juliango202/TerrainVer)  
License: MIT

### What is it?

Generates Worms-style terrain images in HTML5 Canvas

### What do we use it for?

TerrainVer is used to generate the images for the shape of the map. It uses an input image and a seed to produce a randomized map terrain.

[A demo is available of TerrainVer here](https://juliango202.com/terrainver/)

Input image details:
- Red represents the core shape that will not change
- Blue represents the shape that will be randomized

### Furthermore

Box2D cannot use images as input for it's physics map. So we use the result of TerrainVer and pass it through various algorithms to get the polygons of the map.

See MarchingSquaresJS and hxGeomAlgo to understand how the image is converted to Box2D polygons.
