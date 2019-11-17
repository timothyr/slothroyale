## Library: hxGeomAlgo

Sourced from [azrafe7/hxGeomAlgo](https://github.com/azrafe7/hxGeomAlgo)  
License: MIT

### What is it?

Small collection of computational geometry algorithms in Haxe 3.3  
Haxe is a universal language that can transpile to Javascript

### What do we use it for?

hxGeomAlgo contains algorithms that decompose a large polygon into smaller polygons. During Map generation, TerrainVer will produce large images, and MarchingSquares will return very large polygons with thousands of vertices. hxGeomAlgo contains algorithms like SnoeyinkKeil and Bayazit that can decompose a single large polygon into many smaller polygons,  typically containing 6-10 vertices per polygon.

Box2D does not efficiently run when polygons contain thousands of vertices. This library is used to provide Box2D with tens or hundreds of smaller polygons instead of one humongous polygon per map.

### How it was built

build.hxml:
```
-cp src 

# add the class(es) that you want to include the following way, one per line
hxGeomAlgo.HxPoint
hxGeomAlgo.SnoeyinkKeil
hxGeomAlgo.RamerDouglasPeucker
hxGeomAlgo.PolyTools
hxGeomAlgo.Bayazit

-js bin/hxGeomAlgo.js 
```
