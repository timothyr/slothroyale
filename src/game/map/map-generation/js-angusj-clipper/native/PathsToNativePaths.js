"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mem_1 = require("./mem");
var PathToNativePath_1 = require("./PathToNativePath");
// js to c++
function pathsToDoubleArray(nativeClipperLib, myPaths) {
    var nofPaths = myPaths.length;
    // first calculate nof items required
    var nofItems = 1; // for path count
    for (var i = 0; i < nofPaths; i++) {
        nofItems += PathToNativePath_1.getNofItemsForPath(myPaths[i]);
    }
    var heapBytes = mem_1.mallocDoubleArray(nativeClipperLib, nofItems);
    heapBytes[0] = nofPaths;
    var ptr = 1;
    for (var i = 0; i < nofPaths; i++) {
        var path = myPaths[i];
        ptr = PathToNativePath_1.writePathToDoubleArray(path, heapBytes, ptr);
    }
    return heapBytes;
}
exports.pathsToDoubleArray = pathsToDoubleArray;
function doubleArrayToNativePaths(nativeClipperLib, array, freeArray) {
    var p = new nativeClipperLib.Paths();
    nativeClipperLib.toPaths(p, array.byteOffset);
    if (freeArray) {
        mem_1.freeTypedArray(nativeClipperLib, array);
    }
    return p;
}
exports.doubleArrayToNativePaths = doubleArrayToNativePaths;
function pathsToNativePaths(nativeClipperLib, paths) {
    var array = pathsToDoubleArray(nativeClipperLib, paths);
    return doubleArrayToNativePaths(nativeClipperLib, array, true);
}
exports.pathsToNativePaths = pathsToNativePaths;
// c++ to js
function nativePathsToDoubleArray(nativeClipperLib, nativePaths, freeNativePaths) {
    var array = nativeClipperLib.fromPaths(nativePaths);
    if (freeNativePaths) {
        nativePaths.delete();
    }
    return array;
}
exports.nativePathsToDoubleArray = nativePathsToDoubleArray;
function doubleArrayToPaths(nativeClipperLib, array, _freeDoubleArray) {
    var len = array[0];
    var paths = [];
    paths.length = len;
    var arrayI = 1;
    for (var i = 0; i < len; i++) {
        var result = PathToNativePath_1.doubleArrayToPath(nativeClipperLib, array, false, arrayI);
        paths[i] = result.path;
        arrayI = result.ptrEnd;
    }
    if (_freeDoubleArray) {
        mem_1.freeTypedArray(nativeClipperLib, array);
    }
    return paths;
}
exports.doubleArrayToPaths = doubleArrayToPaths;
function nativePathsToPaths(nativeClipperLib, nativePaths, freeNativePaths) {
    var array = nativePathsToDoubleArray(nativeClipperLib, nativePaths, freeNativePaths);
    return doubleArrayToPaths(nativeClipperLib, array, true);
}
exports.nativePathsToPaths = nativePathsToPaths;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aHNUb05hdGl2ZVBhdGhzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL25hdGl2ZS9QYXRoc1RvTmF0aXZlUGF0aHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw2QkFBMEQ7QUFHMUQsdURBQW1HO0FBRW5HLFlBQVk7QUFFWixTQUFnQixrQkFBa0IsQ0FDaEMsZ0JBQTBDLEVBQzFDLE9BQXNCO0lBRXRCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFFaEMscUNBQXFDO0lBQ3JDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtJQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pDLFFBQVEsSUFBSSxxQ0FBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QztJQUNELElBQU0sU0FBUyxHQUFHLHVCQUFpQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hFLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7SUFFeEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsR0FBRyxHQUFHLHlDQUFzQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDcEQ7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBckJELGdEQXFCQztBQUVELFNBQWdCLHdCQUF3QixDQUN0QyxnQkFBMEMsRUFDMUMsS0FBbUIsRUFDbkIsU0FBa0I7SUFFbEIsSUFBTSxDQUFDLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM5QyxJQUFJLFNBQVMsRUFBRTtRQUNiLG9CQUFjLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDekM7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFYRCw0REFXQztBQUVELFNBQWdCLGtCQUFrQixDQUNoQyxnQkFBMEMsRUFDMUMsS0FBb0I7SUFFcEIsSUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUQsT0FBTyx3QkFBd0IsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakUsQ0FBQztBQU5ELGdEQU1DO0FBRUQsWUFBWTtBQUVaLFNBQWdCLHdCQUF3QixDQUN0QyxnQkFBMEMsRUFDMUMsV0FBd0IsRUFDeEIsZUFBd0I7SUFFeEIsSUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RELElBQUksZUFBZSxFQUFFO1FBQ25CLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN0QjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQVZELDREQVVDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQ2hDLGdCQUEwQyxFQUMxQyxLQUFtQixFQUNuQixnQkFBeUI7SUFFekIsSUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLElBQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQztJQUN6QixLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUVuQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzVCLElBQU0sTUFBTSxHQUFHLG9DQUFpQixDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekUsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdkIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7S0FDeEI7SUFFRCxJQUFJLGdCQUFnQixFQUFFO1FBQ3BCLG9CQUFjLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDekM7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFyQkQsZ0RBcUJDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQ2hDLGdCQUEwQyxFQUMxQyxXQUF3QixFQUN4QixlQUF3QjtJQUV4QixJQUFNLEtBQUssR0FBRyx3QkFBd0IsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDdkYsT0FBTyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQVBELGdEQU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGF0aCB9IGZyb20gXCIuLi9QYXRoXCI7XHJcbmltcG9ydCB7IFBhdGhzLCBSZWFkb25seVBhdGhzIH0gZnJvbSBcIi4uL1BhdGhzXCI7XHJcbmltcG9ydCB7IGZyZWVUeXBlZEFycmF5LCBtYWxsb2NEb3VibGVBcnJheSB9IGZyb20gXCIuL21lbVwiO1xyXG5pbXBvcnQgeyBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UgfSBmcm9tIFwiLi9OYXRpdmVDbGlwcGVyTGliSW5zdGFuY2VcIjtcclxuaW1wb3J0IHsgTmF0aXZlUGF0aHMgfSBmcm9tIFwiLi9OYXRpdmVQYXRoc1wiO1xyXG5pbXBvcnQgeyBkb3VibGVBcnJheVRvUGF0aCwgZ2V0Tm9mSXRlbXNGb3JQYXRoLCB3cml0ZVBhdGhUb0RvdWJsZUFycmF5IH0gZnJvbSBcIi4vUGF0aFRvTmF0aXZlUGF0aFwiO1xyXG5cclxuLy8ganMgdG8gYysrXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGF0aHNUb0RvdWJsZUFycmF5KFxyXG4gIG5hdGl2ZUNsaXBwZXJMaWI6IE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZSxcclxuICBteVBhdGhzOiBSZWFkb25seVBhdGhzXHJcbik6IEZsb2F0NjRBcnJheSB7XHJcbiAgY29uc3Qgbm9mUGF0aHMgPSBteVBhdGhzLmxlbmd0aDtcclxuXHJcbiAgLy8gZmlyc3QgY2FsY3VsYXRlIG5vZiBpdGVtcyByZXF1aXJlZFxyXG4gIGxldCBub2ZJdGVtcyA9IDE7IC8vIGZvciBwYXRoIGNvdW50XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2ZQYXRoczsgaSsrKSB7XHJcbiAgICBub2ZJdGVtcyArPSBnZXROb2ZJdGVtc0ZvclBhdGgobXlQYXRoc1tpXSk7XHJcbiAgfVxyXG4gIGNvbnN0IGhlYXBCeXRlcyA9IG1hbGxvY0RvdWJsZUFycmF5KG5hdGl2ZUNsaXBwZXJMaWIsIG5vZkl0ZW1zKTtcclxuICBoZWFwQnl0ZXNbMF0gPSBub2ZQYXRocztcclxuXHJcbiAgbGV0IHB0ciA9IDE7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2ZQYXRoczsgaSsrKSB7XHJcbiAgICBjb25zdCBwYXRoID0gbXlQYXRoc1tpXTtcclxuICAgIHB0ciA9IHdyaXRlUGF0aFRvRG91YmxlQXJyYXkocGF0aCwgaGVhcEJ5dGVzLCBwdHIpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGhlYXBCeXRlcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRvdWJsZUFycmF5VG9OYXRpdmVQYXRocyhcclxuICBuYXRpdmVDbGlwcGVyTGliOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UsXHJcbiAgYXJyYXk6IEZsb2F0NjRBcnJheSxcclxuICBmcmVlQXJyYXk6IGJvb2xlYW5cclxuKTogTmF0aXZlUGF0aHMge1xyXG4gIGNvbnN0IHAgPSBuZXcgbmF0aXZlQ2xpcHBlckxpYi5QYXRocygpO1xyXG4gIG5hdGl2ZUNsaXBwZXJMaWIudG9QYXRocyhwLCBhcnJheS5ieXRlT2Zmc2V0KTtcclxuICBpZiAoZnJlZUFycmF5KSB7XHJcbiAgICBmcmVlVHlwZWRBcnJheShuYXRpdmVDbGlwcGVyTGliLCBhcnJheSk7XHJcbiAgfVxyXG4gIHJldHVybiBwO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGF0aHNUb05hdGl2ZVBhdGhzKFxyXG4gIG5hdGl2ZUNsaXBwZXJMaWI6IE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZSxcclxuICBwYXRoczogUmVhZG9ubHlQYXRoc1xyXG4pOiBOYXRpdmVQYXRocyB7XHJcbiAgY29uc3QgYXJyYXkgPSBwYXRoc1RvRG91YmxlQXJyYXkobmF0aXZlQ2xpcHBlckxpYiwgcGF0aHMpO1xyXG4gIHJldHVybiBkb3VibGVBcnJheVRvTmF0aXZlUGF0aHMobmF0aXZlQ2xpcHBlckxpYiwgYXJyYXksIHRydWUpO1xyXG59XHJcblxyXG4vLyBjKysgdG8ganNcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVQYXRoc1RvRG91YmxlQXJyYXkoXHJcbiAgbmF0aXZlQ2xpcHBlckxpYjogTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlLFxyXG4gIG5hdGl2ZVBhdGhzOiBOYXRpdmVQYXRocyxcclxuICBmcmVlTmF0aXZlUGF0aHM6IGJvb2xlYW5cclxuKTogRmxvYXQ2NEFycmF5IHtcclxuICBjb25zdCBhcnJheSA9IG5hdGl2ZUNsaXBwZXJMaWIuZnJvbVBhdGhzKG5hdGl2ZVBhdGhzKTtcclxuICBpZiAoZnJlZU5hdGl2ZVBhdGhzKSB7XHJcbiAgICBuYXRpdmVQYXRocy5kZWxldGUoKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycmF5O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZG91YmxlQXJyYXlUb1BhdGhzKFxyXG4gIG5hdGl2ZUNsaXBwZXJMaWI6IE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZSxcclxuICBhcnJheTogRmxvYXQ2NEFycmF5LFxyXG4gIF9mcmVlRG91YmxlQXJyYXk6IGJvb2xlYW5cclxuKTogUGF0aHMge1xyXG4gIGNvbnN0IGxlbiA9IGFycmF5WzBdO1xyXG4gIGNvbnN0IHBhdGhzOiBQYXRoW10gPSBbXTtcclxuICBwYXRocy5sZW5ndGggPSBsZW47XHJcblxyXG4gIGxldCBhcnJheUkgPSAxO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGRvdWJsZUFycmF5VG9QYXRoKG5hdGl2ZUNsaXBwZXJMaWIsIGFycmF5LCBmYWxzZSwgYXJyYXlJKTtcclxuICAgIHBhdGhzW2ldID0gcmVzdWx0LnBhdGg7XHJcbiAgICBhcnJheUkgPSByZXN1bHQucHRyRW5kO1xyXG4gIH1cclxuXHJcbiAgaWYgKF9mcmVlRG91YmxlQXJyYXkpIHtcclxuICAgIGZyZWVUeXBlZEFycmF5KG5hdGl2ZUNsaXBwZXJMaWIsIGFycmF5KTtcclxuICB9XHJcblxyXG4gIHJldHVybiBwYXRocztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5hdGl2ZVBhdGhzVG9QYXRocyhcclxuICBuYXRpdmVDbGlwcGVyTGliOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UsXHJcbiAgbmF0aXZlUGF0aHM6IE5hdGl2ZVBhdGhzLFxyXG4gIGZyZWVOYXRpdmVQYXRoczogYm9vbGVhblxyXG4pOiBQYXRocyB7XHJcbiAgY29uc3QgYXJyYXkgPSBuYXRpdmVQYXRoc1RvRG91YmxlQXJyYXkobmF0aXZlQ2xpcHBlckxpYiwgbmF0aXZlUGF0aHMsIGZyZWVOYXRpdmVQYXRocyk7XHJcbiAgcmV0dXJuIGRvdWJsZUFycmF5VG9QYXRocyhuYXRpdmVDbGlwcGVyTGliLCBhcnJheSwgdHJ1ZSk7XHJcbn1cclxuIl19