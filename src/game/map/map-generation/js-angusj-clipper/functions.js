"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var enums_1 = require("./enums");
var nativeEnumConversion_1 = require("./native/nativeEnumConversion");
var PathsToNativePaths_1 = require("./native/PathsToNativePaths");
var PathToNativePath_1 = require("./native/PathToNativePath");
function tryDelete() {
    var objs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objs[_i] = arguments[_i];
    }
    var e_1, _a;
    try {
        for (var objs_1 = __values(objs), objs_1_1 = objs_1.next(); !objs_1_1.done; objs_1_1 = objs_1.next()) {
            var obj = objs_1_1.value;
            if (!obj.isDeleted()) {
                obj.delete();
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (objs_1_1 && !objs_1_1.done && (_a = objs_1.return)) _a.call(objs_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
function area(path) {
    // we use JS since copying structures is slower than actually doing it
    var cnt = path.length;
    if (cnt < 3) {
        return 0;
    }
    var a = 0;
    for (var i = 0, j = cnt - 1; i < cnt; ++i) {
        a += (path[j].x + path[i].x) * (path[j].y - path[i].y);
        j = i;
    }
    return -a * 0.5;
}
exports.area = area;
function cleanPolygon(nativeLib, path, distance) {
    if (distance === void 0) { distance = 1.1415; }
    var nativePath = PathToNativePath_1.pathToNativePath(nativeLib, path);
    try {
        nativeLib.cleanPolygon(nativePath, distance);
        return PathToNativePath_1.nativePathToPath(nativeLib, nativePath, true); // frees nativePath
    }
    finally {
        tryDelete(nativePath);
    }
}
exports.cleanPolygon = cleanPolygon;
function cleanPolygons(nativeLib, paths, distance) {
    if (distance === void 0) { distance = 1.1415; }
    var nativePaths = PathsToNativePaths_1.pathsToNativePaths(nativeLib, paths);
    try {
        nativeLib.cleanPolygons(nativePaths, distance);
        return PathsToNativePaths_1.nativePathsToPaths(nativeLib, nativePaths, true); // frees nativePath
    }
    finally {
        tryDelete(nativePaths);
    }
}
exports.cleanPolygons = cleanPolygons;
function addPolyNodeToPaths(polynode, nt, paths) {
    var match = true;
    switch (nt) {
        case 1 /* Open */:
            return;
        case 2 /* Closed */:
            match = !polynode.isOpen;
            break;
        default:
            break;
    }
    if (polynode.contour.length > 0 && match) {
        paths.push(polynode.contour);
    }
    for (var ii = 0, max = polynode.childs.length; ii < max; ii++) {
        var pn = polynode.childs[ii];
        addPolyNodeToPaths(pn, nt, paths);
    }
}
function closedPathsFromPolyTree(polyTree) {
    // we do this in JS since copying path is more expensive than just doing it
    var result = [];
    // result.Capacity = polytree.Total;
    addPolyNodeToPaths(polyTree, 2 /* Closed */, result);
    return result;
}
exports.closedPathsFromPolyTree = closedPathsFromPolyTree;
function minkowskiDiff(nativeLib, poly1, poly2) {
    var nativePath1 = PathToNativePath_1.pathToNativePath(nativeLib, poly1);
    var nativePath2 = PathToNativePath_1.pathToNativePath(nativeLib, poly2);
    var outNativePaths = new nativeLib.Paths();
    try {
        nativeLib.minkowskiDiff(nativePath1, nativePath2, outNativePaths);
        tryDelete(nativePath1, nativePath2);
        return PathsToNativePaths_1.nativePathsToPaths(nativeLib, outNativePaths, true); // frees outNativePaths
    }
    finally {
        tryDelete(nativePath1, nativePath2, outNativePaths);
    }
}
exports.minkowskiDiff = minkowskiDiff;
function minkowskiSumPath(nativeLib, pattern, path, pathIsClosed) {
    var patternNativePath = PathToNativePath_1.pathToNativePath(nativeLib, pattern);
    var nativePath = PathToNativePath_1.pathToNativePath(nativeLib, path);
    var outNativePaths = new nativeLib.Paths();
    try {
        nativeLib.minkowskiSumPath(patternNativePath, nativePath, outNativePaths, pathIsClosed);
        tryDelete(patternNativePath, nativePath);
        return PathsToNativePaths_1.nativePathsToPaths(nativeLib, outNativePaths, true); // frees outNativePaths
    }
    finally {
        tryDelete(patternNativePath, nativePath, outNativePaths);
    }
}
exports.minkowskiSumPath = minkowskiSumPath;
function minkowskiSumPaths(nativeLib, pattern, paths, pathIsClosed) {
    // TODO: im not sure if for this method we can reuse the input/output path
    var patternNativePath = PathToNativePath_1.pathToNativePath(nativeLib, pattern);
    var nativePaths = PathsToNativePaths_1.pathsToNativePaths(nativeLib, paths);
    try {
        nativeLib.minkowskiSumPaths(patternNativePath, nativePaths, nativePaths, pathIsClosed);
        tryDelete(patternNativePath);
        return PathsToNativePaths_1.nativePathsToPaths(nativeLib, nativePaths, true); // frees nativePaths
    }
    finally {
        tryDelete(patternNativePath, nativePaths);
    }
}
exports.minkowskiSumPaths = minkowskiSumPaths;
function openPathsFromPolyTree(polyTree) {
    // we do this in JS since copying path is more expensive than just doing it
    var result = [];
    var len = polyTree.childs.length;
    result.length = len;
    var resultLength = 0;
    for (var i = 0; i < len; i++) {
        if (polyTree.childs[i].isOpen) {
            result[resultLength++] = polyTree.childs[i].contour;
        }
    }
    result.length = resultLength;
    return result;
}
exports.openPathsFromPolyTree = openPathsFromPolyTree;
function orientation(path) {
    return area(path) >= 0;
}
exports.orientation = orientation;
function pointInPolygon(point, path) {
    // we do this in JS since copying path is more expensive than just doing it
    // returns 0 if false, +1 if true, -1 if pt ON polygon boundary
    // See "The Point in Polygon Problem for Arbitrary Polygons" by Hormann & Agathos
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.88.5498&rep=rep1&type=pdf
    var result = 0;
    var cnt = path.length;
    if (cnt < 3) {
        return 0;
    }
    var ip = path[0];
    for (var i = 1; i <= cnt; ++i) {
        var ipNext = i === cnt ? path[0] : path[i];
        if (ipNext.y === point.y) {
            if (ipNext.x === point.x || (ip.y === point.y && ipNext.x > point.x === ip.x < point.x)) {
                return -1;
            }
        }
        if (ip.y < point.y !== ipNext.y < point.y) {
            if (ip.x >= point.x) {
                if (ipNext.x > point.x) {
                    result = 1 - result;
                }
                else {
                    var d = (ip.x - point.x) * (ipNext.y - point.y) - (ipNext.x - point.x) * (ip.y - point.y);
                    if (d === 0) {
                        return -1;
                    }
                    else if (d > 0 === ipNext.y > ip.y) {
                        result = 1 - result;
                    }
                }
            }
            else {
                if (ipNext.x > point.x) {
                    var d = (ip.x - point.x) * (ipNext.y - point.y) - (ipNext.x - point.x) * (ip.y - point.y);
                    if (d === 0) {
                        return -1;
                    }
                    else if (d > 0 === ipNext.y > ip.y) {
                        result = 1 - result;
                    }
                }
            }
        }
        ip = ipNext;
    }
    return result;
}
exports.pointInPolygon = pointInPolygon;
function polyTreeToPaths(polyTree) {
    // we do this in JS since copying path is more expensive than just doing it
    var result = [];
    // result.Capacity = polytree.total;
    addPolyNodeToPaths(polyTree, 0 /* Any */, result);
    return result;
}
exports.polyTreeToPaths = polyTreeToPaths;
function reversePath(path) {
    // we use JS since copying structures is slower than actually doing it
    path.reverse();
}
exports.reversePath = reversePath;
function reversePaths(paths) {
    // we use JS since copying structures is slower than actually doing it
    for (var i = 0, max = paths.length; i < max; i++) {
        reversePath(paths[i]);
    }
}
exports.reversePaths = reversePaths;
function simplifyPolygon(nativeLib, path, fillType) {
    if (fillType === void 0) { fillType = enums_1.PolyFillType.EvenOdd; }
    var nativePath = PathToNativePath_1.pathToNativePath(nativeLib, path);
    var outNativePaths = new nativeLib.Paths();
    try {
        nativeLib.simplifyPolygon(nativePath, outNativePaths, nativeEnumConversion_1.polyFillTypeToNative(nativeLib, fillType));
        tryDelete(nativePath);
        return PathsToNativePaths_1.nativePathsToPaths(nativeLib, outNativePaths, true); // frees outNativePaths
    }
    finally {
        tryDelete(nativePath, outNativePaths);
    }
}
exports.simplifyPolygon = simplifyPolygon;
function simplifyPolygons(nativeLib, paths, fillType) {
    if (fillType === void 0) { fillType = enums_1.PolyFillType.EvenOdd; }
    var nativePaths = PathsToNativePaths_1.pathsToNativePaths(nativeLib, paths);
    try {
        nativeLib.simplifyPolygonsOverwrite(nativePaths, nativeEnumConversion_1.polyFillTypeToNative(nativeLib, fillType));
        return PathsToNativePaths_1.nativePathsToPaths(nativeLib, nativePaths, true); // frees nativePaths
    }
    finally {
        tryDelete(nativePaths);
    }
}
exports.simplifyPolygons = simplifyPolygons;
function scalePath(path, scale) {
    var sol = [];
    var i = path.length;
    while (i--) {
        var p = path[i];
        sol.push({
            x: Math.round(p.x * scale),
            y: Math.round(p.y * scale)
        });
    }
    return sol;
}
exports.scalePath = scalePath;
/**
 * Scales all inner paths by multiplying all its coordinates by a number and then rounding them.
 *
 * @param paths - Paths to scale
 * @param scale - Scale multiplier
 * @return {Paths} - The scaled paths
 */
function scalePaths(paths, scale) {
    if (scale === 0) {
        return [];
    }
    var sol = [];
    var i = paths.length;
    while (i--) {
        var p = paths[i];
        sol.push(scalePath(p, scale));
    }
    return sol;
}
exports.scalePaths = scalePaths;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Z1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBNkQ7QUFJN0Qsc0VBQXFFO0FBQ3JFLGtFQUFxRjtBQUNyRiw4REFBK0U7QUFNL0UsU0FBUyxTQUFTO0lBQUMsY0FBMEI7U0FBMUIsVUFBMEIsRUFBMUIscUJBQTBCLEVBQTFCLElBQTBCO1FBQTFCLHlCQUEwQjs7OztRQUMzQyxLQUFrQixJQUFBLFNBQUEsU0FBQSxJQUFJLENBQUEsMEJBQUEsNENBQUU7WUFBbkIsSUFBTSxHQUFHLGlCQUFBO1lBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDcEIsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2Q7U0FDRjs7Ozs7Ozs7O0FBQ0gsQ0FBQztBQUVELFNBQWdCLElBQUksQ0FBQyxJQUFrQjtJQUNyQyxzRUFBc0U7SUFDdEUsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN4QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDWCxPQUFPLENBQUMsQ0FBQztLQUNWO0lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUN6QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsR0FBRyxDQUFDLENBQUM7S0FDUDtJQUNE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LEtBQWE7SUFDNUQsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELElBQU0sR0FBRyxHQUFVLEVBQUUsQ0FBQztJQUN0QixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7UUFDVixJQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDL0I7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFaRCxnQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBvaW50SW5Qb2x5Z29uUmVzdWx0LCBQb2x5RmlsbFR5cGUgfSBmcm9tIFwiLi9lbnVtc1wiO1xyXG5pbXBvcnQgeyBJbnRQb2ludCB9IGZyb20gXCIuL0ludFBvaW50XCI7XHJcbmltcG9ydCB7IE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZSB9IGZyb20gXCIuL25hdGl2ZS9OYXRpdmVDbGlwcGVyTGliSW5zdGFuY2VcIjtcclxuaW1wb3J0IHsgTmF0aXZlRGVsZXRhYmxlIH0gZnJvbSBcIi4vbmF0aXZlL05hdGl2ZURlbGV0YWJsZVwiO1xyXG5pbXBvcnQgeyBwb2x5RmlsbFR5cGVUb05hdGl2ZSB9IGZyb20gXCIuL25hdGl2ZS9uYXRpdmVFbnVtQ29udmVyc2lvblwiO1xyXG5pbXBvcnQgeyBuYXRpdmVQYXRoc1RvUGF0aHMsIHBhdGhzVG9OYXRpdmVQYXRocyB9IGZyb20gXCIuL25hdGl2ZS9QYXRoc1RvTmF0aXZlUGF0aHNcIjtcclxuaW1wb3J0IHsgbmF0aXZlUGF0aFRvUGF0aCwgcGF0aFRvTmF0aXZlUGF0aCB9IGZyb20gXCIuL25hdGl2ZS9QYXRoVG9OYXRpdmVQYXRoXCI7XHJcbmltcG9ydCB7IFBhdGgsIFJlYWRvbmx5UGF0aCB9IGZyb20gXCIuL1BhdGhcIjtcclxuaW1wb3J0IHsgUGF0aHMsIFJlYWRvbmx5UGF0aHMgfSBmcm9tIFwiLi9QYXRoc1wiO1xyXG5pbXBvcnQgeyBQb2x5Tm9kZSB9IGZyb20gXCIuL1BvbHlOb2RlXCI7XHJcbmltcG9ydCB7IFBvbHlUcmVlIH0gZnJvbSBcIi4vUG9seVRyZWVcIjtcclxuXHJcbmZ1bmN0aW9uIHRyeURlbGV0ZSguLi5vYmpzOiBOYXRpdmVEZWxldGFibGVbXSkge1xyXG4gIGZvciAoY29uc3Qgb2JqIG9mIG9ianMpIHtcclxuICAgIGlmICghb2JqLmlzRGVsZXRlZCgpKSB7XHJcbiAgICAgIG9iai5kZWxldGUoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcmVhKHBhdGg6IFJlYWRvbmx5UGF0aCk6IG51bWJlciB7XHJcbiAgLy8gd2UgdXNlIEpTIHNpbmNlIGNvcHlpbmcgc3RydWN0dXJlcyBpcyBzbG93ZXIgdGhhbiBhY3R1YWxseSBkb2luZyBpdFxyXG4gIGNvbnN0IGNudCA9IHBhdGgubGVuZ3RoO1xyXG4gIGlmIChjbnQgPCAzKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbiAgbGV0IGEgPSAwO1xyXG4gIGZvciAobGV0IGkgPSAwLCBqID0gY250IC0gMTsgaSA8IGNudDsgKytpKSB7XHJcbiAgICBhICs9IChwYXRoW2pdLnggKyBwYXRoW2ldLngpICogKHBhdGhbal0ueSAtIHBhdGhbaV0ueSk7XHJcbiAgICBqID0gaTtcclxuICB9XHJcbiAgcmV0dXJuIC1hICogMC41O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5Qb2x5Z29uKFxyXG4gIG5hdGl2ZUxpYjogTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlLFxyXG4gIHBhdGg6IFJlYWRvbmx5UGF0aCxcclxuICBkaXN0YW5jZSA9IDEuMTQxNVxyXG4pOiBQYXRoIHtcclxuICBjb25zdCBuYXRpdmVQYXRoID0gcGF0aFRvTmF0aXZlUGF0aChuYXRpdmVMaWIsIHBhdGgpO1xyXG4gIHRyeSB7XHJcbiAgICBuYXRpdmVMaWIuY2xlYW5Qb2x5Z29uKG5hdGl2ZVBhdGgsIGRpc3RhbmNlKTtcclxuICAgIHJldHVybiBuYXRpdmVQYXRoVG9QYXRoKG5hdGl2ZUxpYiwgbmF0aXZlUGF0aCwgdHJ1ZSk7IC8vIGZyZWVzIG5hdGl2ZVBhdGhcclxuICB9IGZpbmFsbHkge1xyXG4gICAgdHJ5RGVsZXRlKG5hdGl2ZVBhdGgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuUG9seWdvbnMoXHJcbiAgbmF0aXZlTGliOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UsXHJcbiAgcGF0aHM6IFJlYWRvbmx5UGF0aHMsXHJcbiAgZGlzdGFuY2UgPSAxLjE0MTVcclxuKTogUGF0aHMge1xyXG4gIGNvbnN0IG5hdGl2ZVBhdGhzID0gcGF0aHNUb05hdGl2ZVBhdGhzKG5hdGl2ZUxpYiwgcGF0aHMpO1xyXG4gIHRyeSB7XHJcbiAgICBuYXRpdmVMaWIuY2xlYW5Qb2x5Z29ucyhuYXRpdmVQYXRocywgZGlzdGFuY2UpO1xyXG4gICAgcmV0dXJuIG5hdGl2ZVBhdGhzVG9QYXRocyhuYXRpdmVMaWIsIG5hdGl2ZVBhdGhzLCB0cnVlKTsgLy8gZnJlZXMgbmF0aXZlUGF0aFxyXG4gIH0gZmluYWxseSB7XHJcbiAgICB0cnlEZWxldGUobmF0aXZlUGF0aHMpO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgZW51bSBOb2RlVHlwZSB7XHJcbiAgQW55LFxyXG4gIE9wZW4sXHJcbiAgQ2xvc2VkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFBvbHlOb2RlVG9QYXRocyhwb2x5bm9kZTogUG9seU5vZGUsIG50OiBOb2RlVHlwZSwgcGF0aHM6IFJlYWRvbmx5UGF0aFtdKTogdm9pZCB7XHJcbiAgbGV0IG1hdGNoID0gdHJ1ZTtcclxuICBzd2l0Y2ggKG50KSB7XHJcbiAgICBjYXNlIE5vZGVUeXBlLk9wZW46XHJcbiAgICAgIHJldHVybjtcclxuICAgIGNhc2UgTm9kZVR5cGUuQ2xvc2VkOlxyXG4gICAgICBtYXRjaCA9ICFwb2x5bm9kZS5pc09wZW47XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICBpZiAocG9seW5vZGUuY29udG91ci5sZW5ndGggPiAwICYmIG1hdGNoKSB7XHJcbiAgICBwYXRocy5wdXNoKHBvbHlub2RlLmNvbnRvdXIpO1xyXG4gIH1cclxuICBmb3IgKGxldCBpaSA9IDAsIG1heCA9IHBvbHlub2RlLmNoaWxkcy5sZW5ndGg7IGlpIDwgbWF4OyBpaSsrKSB7XHJcbiAgICBjb25zdCBwbiA9IHBvbHlub2RlLmNoaWxkc1tpaV07XHJcbiAgICBhZGRQb2x5Tm9kZVRvUGF0aHMocG4sIG50LCBwYXRocyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VkUGF0aHNGcm9tUG9seVRyZWUocG9seVRyZWU6IFBvbHlUcmVlKTogUGF0aHMge1xyXG4gIC8vIHdlIGRvIHRoaXMgaW4gSlMgc2luY2UgY29weWluZyBwYXRoIGlzIG1vcmUgZXhwZW5zaXZlIHRoYW4ganVzdCBkb2luZyBpdFxyXG5cclxuICBjb25zdCByZXN1bHQ6IFBhdGhzID0gW107XHJcbiAgLy8gcmVzdWx0LkNhcGFjaXR5ID0gcG9seXRyZWUuVG90YWw7XHJcbiAgYWRkUG9seU5vZGVUb1BhdGhzKHBvbHlUcmVlLCBOb2RlVHlwZS5DbG9zZWQsIHJlc3VsdCk7XHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbmtvd3NraURpZmYoXHJcbiAgbmF0aXZlTGliOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UsXHJcbiAgcG9seTE6IFJlYWRvbmx5UGF0aCxcclxuICBwb2x5MjogUmVhZG9ubHlQYXRoXHJcbik6IFBhdGhzIHtcclxuICBjb25zdCBuYXRpdmVQYXRoMSA9IHBhdGhUb05hdGl2ZVBhdGgobmF0aXZlTGliLCBwb2x5MSk7XHJcbiAgY29uc3QgbmF0aXZlUGF0aDIgPSBwYXRoVG9OYXRpdmVQYXRoKG5hdGl2ZUxpYiwgcG9seTIpO1xyXG4gIGNvbnN0IG91dE5hdGl2ZVBhdGhzID0gbmV3IG5hdGl2ZUxpYi5QYXRocygpO1xyXG5cclxuICB0cnkge1xyXG4gICAgbmF0aXZlTGliLm1pbmtvd3NraURpZmYobmF0aXZlUGF0aDEsIG5hdGl2ZVBhdGgyLCBvdXROYXRpdmVQYXRocyk7XHJcbiAgICB0cnlEZWxldGUobmF0aXZlUGF0aDEsIG5hdGl2ZVBhdGgyKTtcclxuICAgIHJldHVybiBuYXRpdmVQYXRoc1RvUGF0aHMobmF0aXZlTGliLCBvdXROYXRpdmVQYXRocywgdHJ1ZSk7IC8vIGZyZWVzIG91dE5hdGl2ZVBhdGhzXHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHRyeURlbGV0ZShuYXRpdmVQYXRoMSwgbmF0aXZlUGF0aDIsIG91dE5hdGl2ZVBhdGhzKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtaW5rb3dza2lTdW1QYXRoKFxyXG4gIG5hdGl2ZUxpYjogTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlLFxyXG4gIHBhdHRlcm46IFJlYWRvbmx5UGF0aCxcclxuICBwYXRoOiBSZWFkb25seVBhdGgsXHJcbiAgcGF0aElzQ2xvc2VkOiBib29sZWFuXHJcbik6IFBhdGhzIHtcclxuICBjb25zdCBwYXR0ZXJuTmF0aXZlUGF0aCA9IHBhdGhUb05hdGl2ZVBhdGgobmF0aXZlTGliLCBwYXR0ZXJuKTtcclxuICBjb25zdCBuYXRpdmVQYXRoID0gcGF0aFRvTmF0aXZlUGF0aChuYXRpdmVMaWIsIHBhdGgpO1xyXG4gIGNvbnN0IG91dE5hdGl2ZVBhdGhzID0gbmV3IG5hdGl2ZUxpYi5QYXRocygpO1xyXG5cclxuICB0cnkge1xyXG4gICAgbmF0aXZlTGliLm1pbmtvd3NraVN1bVBhdGgocGF0dGVybk5hdGl2ZVBhdGgsIG5hdGl2ZVBhdGgsIG91dE5hdGl2ZVBhdGhzLCBwYXRoSXNDbG9zZWQpO1xyXG4gICAgdHJ5RGVsZXRlKHBhdHRlcm5OYXRpdmVQYXRoLCBuYXRpdmVQYXRoKTtcclxuICAgIHJldHVybiBuYXRpdmVQYXRoc1RvUGF0aHMobmF0aXZlTGliLCBvdXROYXRpdmVQYXRocywgdHJ1ZSk7IC8vIGZyZWVzIG91dE5hdGl2ZVBhdGhzXHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHRyeURlbGV0ZShwYXR0ZXJuTmF0aXZlUGF0aCwgbmF0aXZlUGF0aCwgb3V0TmF0aXZlUGF0aHMpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbmtvd3NraVN1bVBhdGhzKFxyXG4gIG5hdGl2ZUxpYjogTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlLFxyXG4gIHBhdHRlcm46IFJlYWRvbmx5UGF0aCxcclxuICBwYXRoczogUmVhZG9ubHlQYXRocyxcclxuICBwYXRoSXNDbG9zZWQ6IGJvb2xlYW5cclxuKTogUGF0aHMge1xyXG4gIC8vIFRPRE86IGltIG5vdCBzdXJlIGlmIGZvciB0aGlzIG1ldGhvZCB3ZSBjYW4gcmV1c2UgdGhlIGlucHV0L291dHB1dCBwYXRoXHJcblxyXG4gIGNvbnN0IHBhdHRlcm5OYXRpdmVQYXRoID0gcGF0aFRvTmF0aXZlUGF0aChuYXRpdmVMaWIsIHBhdHRlcm4pO1xyXG4gIGNvbnN0IG5hdGl2ZVBhdGhzID0gcGF0aHNUb05hdGl2ZVBhdGhzKG5hdGl2ZUxpYiwgcGF0aHMpO1xyXG5cclxuICB0cnkge1xyXG4gICAgbmF0aXZlTGliLm1pbmtvd3NraVN1bVBhdGhzKHBhdHRlcm5OYXRpdmVQYXRoLCBuYXRpdmVQYXRocywgbmF0aXZlUGF0aHMsIHBhdGhJc0Nsb3NlZCk7XHJcbiAgICB0cnlEZWxldGUocGF0dGVybk5hdGl2ZVBhdGgpO1xyXG4gICAgcmV0dXJuIG5hdGl2ZVBhdGhzVG9QYXRocyhuYXRpdmVMaWIsIG5hdGl2ZVBhdGhzLCB0cnVlKTsgLy8gZnJlZXMgbmF0aXZlUGF0aHNcclxuICB9IGZpbmFsbHkge1xyXG4gICAgdHJ5RGVsZXRlKHBhdHRlcm5OYXRpdmVQYXRoLCBuYXRpdmVQYXRocyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb3BlblBhdGhzRnJvbVBvbHlUcmVlKHBvbHlUcmVlOiBQb2x5VHJlZSk6IFJlYWRvbmx5UGF0aFtdIHtcclxuICAvLyB3ZSBkbyB0aGlzIGluIEpTIHNpbmNlIGNvcHlpbmcgcGF0aCBpcyBtb3JlIGV4cGVuc2l2ZSB0aGFuIGp1c3QgZG9pbmcgaXRcclxuXHJcbiAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgY29uc3QgbGVuID0gcG9seVRyZWUuY2hpbGRzLmxlbmd0aDtcclxuICByZXN1bHQubGVuZ3RoID0gbGVuO1xyXG4gIGxldCByZXN1bHRMZW5ndGggPSAwO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIGlmIChwb2x5VHJlZS5jaGlsZHNbaV0uaXNPcGVuKSB7XHJcbiAgICAgIHJlc3VsdFtyZXN1bHRMZW5ndGgrK10gPSBwb2x5VHJlZS5jaGlsZHNbaV0uY29udG91cjtcclxuICAgIH1cclxuICB9XHJcbiAgcmVzdWx0Lmxlbmd0aCA9IHJlc3VsdExlbmd0aDtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb3JpZW50YXRpb24ocGF0aDogUmVhZG9ubHlQYXRoKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIGFyZWEocGF0aCkgPj0gMDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBvaW50SW5Qb2x5Z29uKFxyXG4gIHBvaW50OiBSZWFkb25seTxJbnRQb2ludD4sXHJcbiAgcGF0aDogUmVhZG9ubHlQYXRoXHJcbik6IFBvaW50SW5Qb2x5Z29uUmVzdWx0IHtcclxuICAvLyB3ZSBkbyB0aGlzIGluIEpTIHNpbmNlIGNvcHlpbmcgcGF0aCBpcyBtb3JlIGV4cGVuc2l2ZSB0aGFuIGp1c3QgZG9pbmcgaXRcclxuXHJcbiAgLy8gcmV0dXJucyAwIGlmIGZhbHNlLCArMSBpZiB0cnVlLCAtMSBpZiBwdCBPTiBwb2x5Z29uIGJvdW5kYXJ5XHJcbiAgLy8gU2VlIFwiVGhlIFBvaW50IGluIFBvbHlnb24gUHJvYmxlbSBmb3IgQXJiaXRyYXJ5IFBvbHlnb25zXCIgYnkgSG9ybWFubiAmIEFnYXRob3NcclxuICAvLyBodHRwOi8vY2l0ZXNlZXJ4LmlzdC5wc3UuZWR1L3ZpZXdkb2MvZG93bmxvYWQ/ZG9pPTEwLjEuMS44OC41NDk4JnJlcD1yZXAxJnR5cGU9cGRmXHJcbiAgbGV0IHJlc3VsdCA9IDA7XHJcbiAgY29uc3QgY250ID0gcGF0aC5sZW5ndGg7XHJcbiAgaWYgKGNudCA8IDMpIHtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuICBsZXQgaXAgPSBwYXRoWzBdO1xyXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IGNudDsgKytpKSB7XHJcbiAgICBjb25zdCBpcE5leHQgPSBpID09PSBjbnQgPyBwYXRoWzBdIDogcGF0aFtpXTtcclxuICAgIGlmIChpcE5leHQueSA9PT0gcG9pbnQueSkge1xyXG4gICAgICBpZiAoaXBOZXh0LnggPT09IHBvaW50LnggfHwgKGlwLnkgPT09IHBvaW50LnkgJiYgaXBOZXh0LnggPiBwb2ludC54ID09PSBpcC54IDwgcG9pbnQueCkpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChpcC55IDwgcG9pbnQueSAhPT0gaXBOZXh0LnkgPCBwb2ludC55KSB7XHJcbiAgICAgIGlmIChpcC54ID49IHBvaW50LngpIHtcclxuICAgICAgICBpZiAoaXBOZXh0LnggPiBwb2ludC54KSB7XHJcbiAgICAgICAgICByZXN1bHQgPSAxIC0gcmVzdWx0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBkID1cclxuICAgICAgICAgICAgKGlwLnggLSBwb2ludC54KSAqIChpcE5leHQueSAtIHBvaW50LnkpIC0gKGlwTmV4dC54IC0gcG9pbnQueCkgKiAoaXAueSAtIHBvaW50LnkpO1xyXG4gICAgICAgICAgaWYgKGQgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChkID4gMCA9PT0gaXBOZXh0LnkgPiBpcC55KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDEgLSByZXN1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChpcE5leHQueCA+IHBvaW50LngpIHtcclxuICAgICAgICAgIGNvbnN0IGQgPVxyXG4gICAgICAgICAgICAoaXAueCAtIHBvaW50LngpICogKGlwTmV4dC55IC0gcG9pbnQueSkgLSAoaXBOZXh0LnggLSBwb2ludC54KSAqIChpcC55IC0gcG9pbnQueSk7XHJcbiAgICAgICAgICBpZiAoZCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGQgPiAwID09PSBpcE5leHQueSA+IGlwLnkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gMSAtIHJlc3VsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlwID0gaXBOZXh0O1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcG9seVRyZWVUb1BhdGhzKHBvbHlUcmVlOiBQb2x5VHJlZSk6IFBhdGhzIHtcclxuICAvLyB3ZSBkbyB0aGlzIGluIEpTIHNpbmNlIGNvcHlpbmcgcGF0aCBpcyBtb3JlIGV4cGVuc2l2ZSB0aGFuIGp1c3QgZG9pbmcgaXRcclxuXHJcbiAgY29uc3QgcmVzdWx0OiBQYXRocyA9IFtdO1xyXG4gIC8vIHJlc3VsdC5DYXBhY2l0eSA9IHBvbHl0cmVlLnRvdGFsO1xyXG4gIGFkZFBvbHlOb2RlVG9QYXRocyhwb2x5VHJlZSwgTm9kZVR5cGUuQW55LCByZXN1bHQpO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXZlcnNlUGF0aChwYXRoOiBQYXRoKTogdm9pZCB7XHJcbiAgLy8gd2UgdXNlIEpTIHNpbmNlIGNvcHlpbmcgc3RydWN0dXJlcyBpcyBzbG93ZXIgdGhhbiBhY3R1YWxseSBkb2luZyBpdFxyXG4gIHBhdGgucmV2ZXJzZSgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmV2ZXJzZVBhdGhzKHBhdGhzOiBQYXRocyk6IHZvaWQge1xyXG4gIC8vIHdlIHVzZSBKUyBzaW5jZSBjb3B5aW5nIHN0cnVjdHVyZXMgaXMgc2xvd2VyIHRoYW4gYWN0dWFsbHkgZG9pbmcgaXRcclxuICBmb3IgKGxldCBpID0gMCwgbWF4ID0gcGF0aHMubGVuZ3RoOyBpIDwgbWF4OyBpKyspIHtcclxuICAgIHJldmVyc2VQYXRoKHBhdGhzW2ldKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaW1wbGlmeVBvbHlnb24oXHJcbiAgbmF0aXZlTGliOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UsXHJcbiAgcGF0aDogUmVhZG9ubHlQYXRoLFxyXG4gIGZpbGxUeXBlOiBQb2x5RmlsbFR5cGUgPSBQb2x5RmlsbFR5cGUuRXZlbk9kZFxyXG4pOiBQYXRocyB7XHJcbiAgY29uc3QgbmF0aXZlUGF0aCA9IHBhdGhUb05hdGl2ZVBhdGgobmF0aXZlTGliLCBwYXRoKTtcclxuICBjb25zdCBvdXROYXRpdmVQYXRocyA9IG5ldyBuYXRpdmVMaWIuUGF0aHMoKTtcclxuICB0cnkge1xyXG4gICAgbmF0aXZlTGliLnNpbXBsaWZ5UG9seWdvbihcclxuICAgICAgbmF0aXZlUGF0aCxcclxuICAgICAgb3V0TmF0aXZlUGF0aHMsXHJcbiAgICAgIHBvbHlGaWxsVHlwZVRvTmF0aXZlKG5hdGl2ZUxpYiwgZmlsbFR5cGUpXHJcbiAgICApO1xyXG4gICAgdHJ5RGVsZXRlKG5hdGl2ZVBhdGgpO1xyXG4gICAgcmV0dXJuIG5hdGl2ZVBhdGhzVG9QYXRocyhuYXRpdmVMaWIsIG91dE5hdGl2ZVBhdGhzLCB0cnVlKTsgLy8gZnJlZXMgb3V0TmF0aXZlUGF0aHNcclxuICB9IGZpbmFsbHkge1xyXG4gICAgdHJ5RGVsZXRlKG5hdGl2ZVBhdGgsIG91dE5hdGl2ZVBhdGhzKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaW1wbGlmeVBvbHlnb25zKFxyXG4gIG5hdGl2ZUxpYjogTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlLFxyXG4gIHBhdGhzOiBSZWFkb25seVBhdGhzLFxyXG4gIGZpbGxUeXBlOiBQb2x5RmlsbFR5cGUgPSBQb2x5RmlsbFR5cGUuRXZlbk9kZFxyXG4pOiBQYXRocyB7XHJcbiAgY29uc3QgbmF0aXZlUGF0aHMgPSBwYXRoc1RvTmF0aXZlUGF0aHMobmF0aXZlTGliLCBwYXRocyk7XHJcbiAgdHJ5IHtcclxuICAgIG5hdGl2ZUxpYi5zaW1wbGlmeVBvbHlnb25zT3ZlcndyaXRlKG5hdGl2ZVBhdGhzLCBwb2x5RmlsbFR5cGVUb05hdGl2ZShuYXRpdmVMaWIsIGZpbGxUeXBlKSk7XHJcbiAgICByZXR1cm4gbmF0aXZlUGF0aHNUb1BhdGhzKG5hdGl2ZUxpYiwgbmF0aXZlUGF0aHMsIHRydWUpOyAvLyBmcmVlcyBuYXRpdmVQYXRoc1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICB0cnlEZWxldGUobmF0aXZlUGF0aHMpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlUGF0aChwYXRoOiBSZWFkb25seVBhdGgsIHNjYWxlOiBudW1iZXIpOiBQYXRoIHtcclxuICBjb25zdCBzb2w6IFBhdGggPSBbXTtcclxuICBsZXQgaSA9IHBhdGgubGVuZ3RoO1xyXG4gIHdoaWxlIChpLS0pIHtcclxuICAgIGNvbnN0IHAgPSBwYXRoW2ldO1xyXG4gICAgc29sLnB1c2goe1xyXG4gICAgICB4OiBNYXRoLnJvdW5kKHAueCAqIHNjYWxlKSxcclxuICAgICAgeTogTWF0aC5yb3VuZChwLnkgKiBzY2FsZSlcclxuICAgIH0pO1xyXG4gIH1cclxuICByZXR1cm4gc29sO1xyXG59XHJcblxyXG4vKipcclxuICogU2NhbGVzIGFsbCBpbm5lciBwYXRocyBieSBtdWx0aXBseWluZyBhbGwgaXRzIGNvb3JkaW5hdGVzIGJ5IGEgbnVtYmVyIGFuZCB0aGVuIHJvdW5kaW5nIHRoZW0uXHJcbiAqXHJcbiAqIEBwYXJhbSBwYXRocyAtIFBhdGhzIHRvIHNjYWxlXHJcbiAqIEBwYXJhbSBzY2FsZSAtIFNjYWxlIG11bHRpcGxpZXJcclxuICogQHJldHVybiB7UGF0aHN9IC0gVGhlIHNjYWxlZCBwYXRoc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlUGF0aHMocGF0aHM6IFJlYWRvbmx5UGF0aHMsIHNjYWxlOiBudW1iZXIpOiBQYXRocyB7XHJcbiAgaWYgKHNjYWxlID09PSAwKSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICBjb25zdCBzb2w6IFBhdGhzID0gW107XHJcbiAgbGV0IGkgPSBwYXRocy5sZW5ndGg7XHJcbiAgd2hpbGUgKGktLSkge1xyXG4gICAgY29uc3QgcCA9IHBhdGhzW2ldO1xyXG4gICAgc29sLnB1c2goc2NhbGVQYXRoKHAsIHNjYWxlKSk7XHJcbiAgfVxyXG4gIHJldHVybiBzb2w7XHJcbn1cclxuIl19