"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var clipFunctions_1 = require("./clipFunctions");
var ClipperError_1 = require("./ClipperError");
exports.ClipperError = ClipperError_1.ClipperError;
var constants_1 = require("./constants");
var enums_1 = require("./enums");
exports.ClipType = enums_1.ClipType;
exports.EndType = enums_1.EndType;
exports.JoinType = enums_1.JoinType;
exports.NativeClipperLibLoadedFormat = enums_1.NativeClipperLibLoadedFormat;
exports.NativeClipperLibRequestedFormat = enums_1.NativeClipperLibRequestedFormat;
exports.PointInPolygonResult = enums_1.PointInPolygonResult;
exports.PolyFillType = enums_1.PolyFillType;
var functions = require("./functions");
var offsetFunctions_1 = require("./offsetFunctions");
var PolyNode_1 = require("./PolyNode");
exports.PolyNode = PolyNode_1.PolyNode;
var PolyTree_1 = require("./PolyTree");
exports.PolyTree = PolyTree_1.PolyTree;
var wasmModule;
var asmJsModule;
/**
 * A wrapper for the Native Clipper Library instance with all the operations available.
 */
var ClipperLibWrapper = /** @class */ (function () {
    /**
     * Internal constructor. Use loadNativeClipperLibInstanceAsync instead.
     *
     * @param instance
     * @param format
     */
    function ClipperLibWrapper(instance, format) {
        this.format = format;
        this.instance = instance;
    }
    /**
     * Performs a polygon clipping (boolean) operation, returning the resulting Paths or throwing an error if failed.
     *
     * The solution parameter in this case is a Paths or PolyTree structure. The Paths structure is simpler than the PolyTree structure. Because of this it is
     * quicker to populate and hence clipping performance is a little better (it's roughly 10% faster). However, the PolyTree data structure provides more
     * information about the returned paths which may be important to users. Firstly, the PolyTree structure preserves nested parent-child polygon relationships
     * (ie outer polygons owning/containing holes and holes owning/containing other outer polygons etc). Also, only the PolyTree structure can differentiate
     * between open and closed paths since each PolyNode has an IsOpen property. (The Path structure has no member indicating whether it's open or closed.)
     * For this reason, when open paths are passed to a Clipper object, the user must use a PolyTree object as the solution parameter, otherwise an exception
     * will be raised.
     *
     * When a PolyTree object is used in a clipping operation on open paths, two ancilliary functions have been provided to quickly separate out open and
     * closed paths from the solution - OpenPathsFromPolyTree and ClosedPathsFromPolyTree. PolyTreeToPaths is also available to convert path data to a Paths
     * structure (irrespective of whether they're open or closed).
     *
     * There are several things to note about the solution paths returned:
     * - they aren't in any specific order
     * - they should never overlap or be self-intersecting (but see notes on rounding)
     * - holes will be oriented opposite outer polygons
     * - the solution fill type can be considered either EvenOdd or NonZero since it will comply with either filling rule
     * - polygons may rarely share a common edge (though this is now very rare as of version 6)
     *
     * @param params - clipping operation data
     * @return {Paths} - the resulting Paths.
     */
    ClipperLibWrapper.prototype.clipToPaths = function (params) {
        return clipFunctions_1.clipToPaths(this.instance, params);
    };
    /**
     * Performs a polygon clipping (boolean) operation, returning the resulting PolyTree or throwing an error if failed.
     *
     * The solution parameter in this case is a Paths or PolyTree structure. The Paths structure is simpler than the PolyTree structure. Because of this it is
     * quicker to populate and hence clipping performance is a little better (it's roughly 10% faster). However, the PolyTree data structure provides more
     * information about the returned paths which may be important to users. Firstly, the PolyTree structure preserves nested parent-child polygon relationships
     * (ie outer polygons owning/containing holes and holes owning/containing other outer polygons etc). Also, only the PolyTree structure can differentiate
     * between open and closed paths since each PolyNode has an IsOpen property. (The Path structure has no member indicating whether it's open or closed.)
     * For this reason, when open paths are passed to a Clipper object, the user must use a PolyTree object as the solution parameter, otherwise an exception
     * will be raised.
     *
     * When a PolyTree object is used in a clipping operation on open paths, two ancilliary functions have been provided to quickly separate out open and
     * closed paths from the solution - OpenPathsFromPolyTree and ClosedPathsFromPolyTree. PolyTreeToPaths is also available to convert path data to a Paths
     * structure (irrespective of whether they're open or closed).
     *
     * There are several things to note about the solution paths returned:
     * - they aren't in any specific order
     * - they should never overlap or be self-intersecting (but see notes on rounding)
     * - holes will be oriented opposite outer polygons
     * - the solution fill type can be considered either EvenOdd or NonZero since it will comply with either filling rule
     * - polygons may rarely share a common edge (though this is now very rare as of version 6)
     *
     * @param params - clipping operation data
     * @return {PolyTree} - the resulting PolyTree or undefined.
     */
    ClipperLibWrapper.prototype.clipToPolyTree = function (params) {
        return clipFunctions_1.clipToPolyTree(this.instance, params);
    };
    /**
     * Performs a polygon offset operation, returning the resulting Paths or undefined if failed.
     *
     * This method encapsulates the process of offsetting (inflating/deflating) both open and closed paths using a number of different join types
     * and end types.
     *
     * Preconditions for offsetting:
     * 1. The orientations of closed paths must be consistent such that outer polygons share the same orientation, and any holes have the opposite orientation
     * (ie non-zero filling). Open paths must be oriented with closed outer polygons.
     * 2. Polygons must not self-intersect.
     *
     * Limitations:
     * When offsetting, small artefacts may appear where polygons overlap. To avoid these artefacts, offset overlapping polygons separately.
     *
     * @param params - offset operation params
     * @return {Paths|undefined} - the resulting Paths or undefined if failed.
     */
    ClipperLibWrapper.prototype.offsetToPaths = function (params) {
        return offsetFunctions_1.offsetToPaths(this.instance, params);
    };
    /**
     * Performs a polygon offset operation, returning the resulting PolyTree or undefined if failed.
     *
     * This method encapsulates the process of offsetting (inflating/deflating) both open and closed paths using a number of different join types
     * and end types.
     *
     * Preconditions for offsetting:
     * 1. The orientations of closed paths must be consistent such that outer polygons share the same orientation, and any holes have the opposite orientation
     * (ie non-zero filling). Open paths must be oriented with closed outer polygons.
     * 2. Polygons must not self-intersect.
     *
     * Limitations:
     * When offsetting, small artefacts may appear where polygons overlap. To avoid these artefacts, offset overlapping polygons separately.
     *
     * @param params - offset operation params
     * @return {PolyTree|undefined} - the resulting PolyTree or undefined if failed.
     */
    ClipperLibWrapper.prototype.offsetToPolyTree = function (params) {
        return offsetFunctions_1.offsetToPolyTree(this.instance, params);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * This function returns the area of the supplied polygon. It's assumed that the path is closed and does not self-intersect. Depending on orientation,
     * this value may be positive or negative. If Orientation is true, then the area will be positive and conversely, if Orientation is false, then the
     * area will be negative.
     *
     * @param path - The path
     * @return {number} - Area
     */
    ClipperLibWrapper.prototype.area = function (path) {
        return functions.area(path);
    };
    /**
     * Removes vertices:
     * - that join co-linear edges, or join edges that are almost co-linear (such that if the vertex was moved no more than the specified distance the edges
     * would be co-linear)
     * - that are within the specified distance of an adjacent vertex
     * - that are within the specified distance of a semi-adjacent vertex together with their out-lying vertices
     *
     * Vertices are semi-adjacent when they are separated by a single (out-lying) vertex.
     *
     * The distance parameter's default value is approximately √2 so that a vertex will be removed when adjacent or semi-adjacent vertices having their
     * corresponding X and Y coordinates differing by no more than 1 unit. (If the egdes are semi-adjacent the out-lying vertex will be removed too.)
     *
     * @param path - The path to clean
     * @param distance - How close points need to be before they are cleaned
     * @return {Path} - The cleaned path
     */
    ClipperLibWrapper.prototype.cleanPolygon = function (path, distance) {
        if (distance === void 0) { distance = 1.1415; }
        return functions.cleanPolygon(this.instance, path, distance);
    };
    /**
     * Removes vertices:
     * - that join co-linear edges, or join edges that are almost co-linear (such that if the vertex was moved no more than the specified distance the edges
     * would be co-linear)
     * - that are within the specified distance of an adjacent vertex
     * - that are within the specified distance of a semi-adjacent vertex together with their out-lying vertices
     *
     * Vertices are semi-adjacent when they are separated by a single (out-lying) vertex.
     *
     * The distance parameter's default value is approximately √2 so that a vertex will be removed when adjacent or semi-adjacent vertices having their
     * corresponding X and Y coordinates differing by no more than 1 unit. (If the egdes are semi-adjacent the out-lying vertex will be removed too.)
     *
     * @param paths - The paths to clean
     * @param distance - How close points need to be before they are cleaned
     * @return {Paths} - The cleaned paths
     */
    ClipperLibWrapper.prototype.cleanPolygons = function (paths, distance) {
        if (distance === void 0) { distance = 1.1415; }
        return functions.cleanPolygons(this.instance, paths, distance);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * This function filters out open paths from the PolyTree structure and returns only closed paths in a Paths structure.
     *
     * @param polyTree
     * @return {Paths}
     */
    ClipperLibWrapper.prototype.closedPathsFromPolyTree = function (polyTree) {
        return functions.closedPathsFromPolyTree(polyTree);
    };
    /**
     *  Minkowski Difference is performed by subtracting each point in a polygon from the set of points in an open or closed path. A key feature of Minkowski
     *  Difference is that when it's applied to two polygons, the resulting polygon will contain the coordinate space origin whenever the two polygons touch or
     *  overlap. (This function is often used to determine when polygons collide.)
     *
     * @param poly1
     * @param poly2
     * @return {Paths}
     */
    ClipperLibWrapper.prototype.minkowskiDiff = function (poly1, poly2) {
        return functions.minkowskiDiff(this.instance, poly1, poly2);
    };
    /**
     * Minkowski Addition is performed by adding each point in a polygon 'pattern' to the set of points in an open or closed path. The resulting polygon
     * (or polygons) defines the region that the 'pattern' would pass over in moving from the beginning to the end of the 'path'.
     *
     * @param pattern
     * @param path
     * @param pathIsClosed
     * @return {Paths}
     */
    ClipperLibWrapper.prototype.minkowskiSumPath = function (pattern, path, pathIsClosed) {
        return functions.minkowskiSumPath(this.instance, pattern, path, pathIsClosed);
    };
    /**
     * Minkowski Addition is performed by adding each point in a polygon 'pattern' to the set of points in an open or closed path. The resulting polygon
     * (or polygons) defines the region that the 'pattern' would pass over in moving from the beginning to the end of the 'path'.
     *
     * @param pattern
     * @param paths
     * @param pathIsClosed
     * @return {Paths}
     */
    ClipperLibWrapper.prototype.minkowskiSumPaths = function (pattern, paths, pathIsClosed) {
        return functions.minkowskiSumPaths(this.instance, pattern, paths, pathIsClosed);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * This function filters out closed paths from the PolyTree structure and returns only open paths in a Paths structure.
     *
     * @param polyTree
     * @return {ReadonlyPath[]}
     */
    ClipperLibWrapper.prototype.openPathsFromPolyTree = function (polyTree) {
        return functions.openPathsFromPolyTree(polyTree);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Orientation is only important to closed paths. Given that vertices are declared in a specific order, orientation refers to the direction (clockwise or
     * counter-clockwise) that these vertices progress around a closed path.
     *
     * Orientation is also dependent on axis direction:
     * - On Y-axis positive upward displays, orientation will return true if the polygon's orientation is counter-clockwise.
     * - On Y-axis positive downward displays, orientation will return true if the polygon's orientation is clockwise.
     *
     * Notes:
     * - Self-intersecting polygons have indeterminate orientations in which case this function won't return a meaningful value.
     * - The majority of 2D graphic display libraries (eg GDI, GDI+, XLib, Cairo, AGG, Graphics32) and even the SVG file format have their coordinate origins
     * at the top-left corner of their respective viewports with their Y axes increasing downward. However, some display libraries (eg Quartz, OpenGL) have their
     * coordinate origins undefined or in the classic bottom-left position with their Y axes increasing upward.
     * - For Non-Zero filled polygons, the orientation of holes must be opposite that of outer polygons.
     * - For closed paths (polygons) in the solution returned by the clip method, their orientations will always be true for outer polygons and false
     * for hole polygons (unless the reverseSolution property has been enabled).
     *
     * @param path - Path
     * @return {boolean}
     */
    ClipperLibWrapper.prototype.orientation = function (path) {
        return functions.orientation(path);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Returns PointInPolygonResult.Outside when false, PointInPolygonResult.OnBoundary when point is on poly and PointInPolygonResult.Inside when point is in
     * poly.
     *
     * It's assumed that 'poly' is closed and does not self-intersect.
     *
     * @param point
     * @param path
     * @return {PointInPolygonResult}
     */
    ClipperLibWrapper.prototype.pointInPolygon = function (point, path) {
        return functions.pointInPolygon(point, path);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * This function converts a PolyTree structure into a Paths structure.
     *
     * @param polyTree
     * @return {Paths}
     */
    ClipperLibWrapper.prototype.polyTreeToPaths = function (polyTree) {
        return functions.polyTreeToPaths(polyTree);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Reverses the vertex order (and hence orientation) in the specified path.
     *
     * @param path - Path to reverse, which gets overwritten rather than copied
     */
    ClipperLibWrapper.prototype.reversePath = function (path) {
        functions.reversePath(path);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Reverses the vertex order (and hence orientation) in each contained path.
     *
     * @param paths - Paths to reverse, which get overwritten rather than copied
     */
    ClipperLibWrapper.prototype.reversePaths = function (paths) {
        functions.reversePaths(paths);
    };
    /**
     * Removes self-intersections from the supplied polygon (by performing a boolean union operation using the nominated PolyFillType).
     * Polygons with non-contiguous duplicate vertices (ie 'touching') will be split into two polygons.
     *
     * Note: There's currently no guarantee that polygons will be strictly simple since 'simplifying' is still a work in progress.
     *
     * @param path
     * @param fillType
     * @return {Paths} - The solution
     */
    ClipperLibWrapper.prototype.simplifyPolygon = function (path, fillType) {
        if (fillType === void 0) { fillType = enums_1.PolyFillType.EvenOdd; }
        return functions.simplifyPolygon(this.instance, path, fillType);
    };
    /**
     * Removes self-intersections from the supplied polygons (by performing a boolean union operation using the nominated PolyFillType).
     * Polygons with non-contiguous duplicate vertices (ie 'vertices are touching') will be split into two polygons.
     *
     * Note: There's currently no guarantee that polygons will be strictly simple since 'simplifying' is still a work in progress.
     *
     * @param paths
     * @param fillType
     * @return {Paths} - The solution
     */
    ClipperLibWrapper.prototype.simplifyPolygons = function (paths, fillType) {
        if (fillType === void 0) { fillType = enums_1.PolyFillType.EvenOdd; }
        return functions.simplifyPolygons(this.instance, paths, fillType);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Scales a path by multiplying all its points by a number and then rounding them.
     *
     * @param path - Path to scale
     * @param scale - Scale multiplier
     * @return {Path} - The scaled path
     */
    ClipperLibWrapper.prototype.scalePath = function (path, scale) {
        return functions.scalePath(path, scale);
    };
    //noinspection JSMethodCanBeStatic
    /**
     * Scales all inner paths by multiplying all its points by a number and then rounding them.
     *
     * @param paths - Paths to scale
     * @param scale - Scale multiplier
     * @return {Paths} - The scaled paths
     */
    ClipperLibWrapper.prototype.scalePaths = function (paths, scale) {
        return functions.scalePaths(paths, scale);
    };
    /**
     * Max coordinate value (both positive and negative).
     */
    ClipperLibWrapper.hiRange = constants_1.hiRange;
    return ClipperLibWrapper;
}());
exports.ClipperLibWrapper = ClipperLibWrapper;
/**
 * Asynchronously tries to load a new native instance of the clipper library to be shared across all method invocations.
 *
 * @param format - Format to load, either WasmThenAsmJs, WasmOnly or AsmJsOnly.
 * @return {Promise<ClipperLibWrapper>} - Promise that resolves with the wrapper instance.
 */
exports.loadNativeClipperLibInstanceAsync = function (format) { return __awaiter(_this, void 0, void 0, function () {
    function getModuleAsync(initModule) {
        return new Promise(function (resolve, reject) {
            var finalModule;
            //noinspection JSUnusedLocalSymbols
            var moduleOverrides = {
                noExitRuntime: true,
                preRun: function () {
                    if (finalModule) {
                        resolve(finalModule);
                    }
                    else {
                        setTimeout(function () {
                            resolve(finalModule);
                        }, 1);
                    }
                },
                quit: function (code, err) {
                    reject(err);
                }
            };
            finalModule = initModule(moduleOverrides);
        });
    }
    var tryWasm, tryAsmJs, initModule, err_1, initModule, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                switch (format) {
                    case enums_1.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback:
                        tryWasm = true;
                        tryAsmJs = true;
                        break;
                    case enums_1.NativeClipperLibRequestedFormat.WasmOnly:
                        tryWasm = true;
                        tryAsmJs = false;
                        break;
                    case enums_1.NativeClipperLibRequestedFormat.AsmJsOnly:
                        tryWasm = false;
                        tryAsmJs = true;
                        break;
                    default:
                        throw new ClipperError_1.ClipperError("unknown native clipper format");
                }
                if (!tryWasm) return [3 /*break*/, 7];
                if (!(wasmModule instanceof Error)) return [3 /*break*/, 1];
                return [3 /*break*/, 7];
            case 1:
                if (!(wasmModule === undefined)) return [3 /*break*/, 6];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                initModule = require("./wasm/clipper-wasm").init;
                return [4 /*yield*/, getModuleAsync(initModule)];
            case 3:
                wasmModule = _a.sent();
                return [2 /*return*/, new ClipperLibWrapper(wasmModule, enums_1.NativeClipperLibLoadedFormat.Wasm)];
            case 4:
                err_1 = _a.sent();
                wasmModule = err_1;
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 7];
            case 6: return [2 /*return*/, new ClipperLibWrapper(wasmModule, enums_1.NativeClipperLibLoadedFormat.Wasm)];
            case 7:
                if (!tryAsmJs) return [3 /*break*/, 14];
                if (!(asmJsModule instanceof Error)) return [3 /*break*/, 8];
                return [3 /*break*/, 14];
            case 8:
                if (!(asmJsModule === undefined)) return [3 /*break*/, 13];
                _a.label = 9;
            case 9:
                _a.trys.push([9, 11, , 12]);
                initModule = require("./wasm/clipper").init;
                return [4 /*yield*/, getModuleAsync(initModule)];
            case 10:
                asmJsModule = _a.sent();
                return [2 /*return*/, new ClipperLibWrapper(asmJsModule, enums_1.NativeClipperLibLoadedFormat.AsmJs)];
            case 11:
                err_2 = _a.sent();
                asmJsModule = err_2;
                return [3 /*break*/, 12];
            case 12: return [3 /*break*/, 14];
            case 13: return [2 /*return*/, new ClipperLibWrapper(asmJsModule, enums_1.NativeClipperLibLoadedFormat.AsmJs)];
            case 14: throw new ClipperError_1.ClipperError("could not load native clipper in the desired format");
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUJBOGZBOztBQTlmQSxpREFBcUY7QUFDckYsK0NBQThDO0FBMEM1Qyx1QkExQ08sMkJBQVksQ0EwQ1A7QUF6Q2QseUNBQXNDO0FBQ3RDLGlDQVFpQjtBQWFmLG1CQXBCQSxnQkFBUSxDQW9CQTtBQUNSLGtCQXBCQSxlQUFPLENBb0JBO0FBQ1AsbUJBcEJBLGdCQUFRLENBb0JBO0FBRVIsdUNBckJBLG9DQUE0QixDQXFCQTtBQUM1QiwwQ0FyQkEsdUNBQStCLENBcUJBO0FBQy9CLCtCQXJCQSw0QkFBb0IsQ0FxQkE7QUFIcEIsdUJBakJBLG9CQUFZLENBaUJBO0FBZmQsdUNBQXlDO0FBSXpDLHFEQUErRjtBQUcvRix1Q0FBc0M7QUFZcEMsbUJBWk8sbUJBQVEsQ0FZUDtBQVhWLHVDQUFzQztBQVlwQyxtQkFaTyxtQkFBUSxDQVlQO0FBY1YsSUFBSSxVQUF3RCxDQUFDO0FBQzdELElBQUksV0FBaUQsQ0FBQztBQUV0RDs7R0FFRztBQUNIO0lBZ0JFOzs7OztPQUtHO0lBQ0gsMkJBQVksUUFBa0MsRUFBRSxNQUFvQztRQUNsRixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCRztJQUNILHVDQUFXLEdBQVgsVUFBWSxNQUFrQjtRQUM1QixPQUFPLDJCQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXdCRztJQUNILDBDQUFjLEdBQWQsVUFBZSxNQUFrQjtRQUMvQixPQUFPLDhCQUFjLENBQUMsSUFBSSxD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Qzs7O0tBQy9FLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbGlwSW5wdXQsIENsaXBQYXJhbXMsIGNsaXBUb1BhdGhzLCBjbGlwVG9Qb2x5VHJlZSB9IGZyb20gXCIuL2NsaXBGdW5jdGlvbnNcIjtcclxuaW1wb3J0IHsgQ2xpcHBlckVycm9yIH0gZnJvbSBcIi4vQ2xpcHBlckVycm9yXCI7XHJcbmltcG9ydCB7IGhpUmFuZ2UgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcclxuaW1wb3J0IHtcclxuICBDbGlwVHlwZSxcclxuICBFbmRUeXBlLFxyXG4gIEpvaW5UeXBlLFxyXG4gIE5hdGl2ZUNsaXBwZXJMaWJMb2FkZWRGb3JtYXQsXHJcbiAgTmF0aXZlQ2xpcHBlckxpYlJlcXVlc3RlZEZvcm1hdCxcclxuICBQb2ludEluUG9seWdvblJlc3VsdCxcclxuICBQb2x5RmlsbFR5cGVcclxufSBmcm9tIFwiLi9lbnVtc1wiO1xyXG5pbXBvcnQgKiBhcyBmdW5jdGlvbnMgZnJvbSBcIi4vZnVuY3Rpb25zXCI7XHJcbmltcG9ydCB7IEludFBvaW50IH0gZnJvbSBcIi4vSW50UG9pbnRcIjtcclxuaW1wb3J0IHsgSW50UmVjdCB9IGZyb20gXCIuL0ludFJlY3RcIjtcclxuaW1wb3J0IHsgTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlIH0gZnJvbSBcIi4vbmF0aXZlL05hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZVwiO1xyXG5pbXBvcnQgeyBPZmZzZXRJbnB1dCwgT2Zmc2V0UGFyYW1zLCBvZmZzZXRUb1BhdGhzLCBvZmZzZXRUb1BvbHlUcmVlIH0gZnJvbSBcIi4vb2Zmc2V0RnVuY3Rpb25zXCI7XHJcbmltcG9ydCB7IFBhdGgsIFJlYWRvbmx5UGF0aCB9IGZyb20gXCIuL1BhdGhcIjtcclxuaW1wb3J0IHsgUGF0aHMsIFJlYWRvbmx5UGF0aHMgfSBmcm9tIFwiLi9QYXRoc1wiO1xyXG5pbXBvcnQgeyBQb2x5Tm9kZSB9IGZyb20gXCIuL1BvbHlOb2RlXCI7XHJcbmltcG9ydCB7IFBvbHlUcmVlIH0gZnJvbSBcIi4vUG9seVRyZWVcIjtcclxuXHJcbi8vIGV4cG9ydCB0eXBlc1xyXG5leHBvcnQge1xyXG4gIENsaXBUeXBlLFxyXG4gIEVuZFR5cGUsXHJcbiAgSm9pblR5cGUsXHJcbiAgUG9seUZpbGxUeXBlLFxyXG4gIE5hdGl2ZUNsaXBwZXJMaWJMb2FkZWRGb3JtYXQsXHJcbiAgTmF0aXZlQ2xpcHBlckxpYlJlcXVlc3RlZEZvcm1hdCxcclxuICBQb2ludEluUG9seWdvblJlc3VsdCxcclxuICBQb2x5Tm9kZSxcclxuICBQb2x5VHJlZSxcclxuICBJbnRQb2ludCxcclxuICBJbnRSZWN0LFxyXG4gIFBhdGgsXHJcbiAgUmVhZG9ubHlQYXRoLFxyXG4gIFBhdGhzLFxyXG4gIFJlYWRvbmx5UGF0aHMsXHJcbiAgQ2xpcElucHV0LFxyXG4gIENsaXBQYXJhbXMsXHJcbiAgT2Zmc2V0SW5wdXQsXHJcbiAgT2Zmc2V0UGFyYW1zLFxyXG4gIENsaXBwZXJFcnJvclxyXG59O1xyXG5cclxubGV0IHdhc21Nb2R1bGU6IE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZSB8IHVuZGVmaW5lZCB8IEVycm9yO1xyXG5sZXQgYXNtSnNNb2R1bGU6IE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZSB8IHVuZGVmaW5lZDtcclxuXHJcbi8qKlxyXG4gKiBBIHdyYXBwZXIgZm9yIHRoZSBOYXRpdmUgQ2xpcHBlciBMaWJyYXJ5IGluc3RhbmNlIHdpdGggYWxsIHRoZSBvcGVyYXRpb25zIGF2YWlsYWJsZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDbGlwcGVyTGliV3JhcHBlciB7XHJcbiAgLyoqXHJcbiAgICogTWF4IGNvb3JkaW5hdGUgdmFsdWUgKGJvdGggcG9zaXRpdmUgYW5kIG5lZ2F0aXZlKS5cclxuICAgKi9cclxuICBzdGF0aWMgcmVhZG9ubHkgaGlSYW5nZSA9IGhpUmFuZ2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5hdGl2ZSBsaWJyYXJ5IGluc3RhbmNlLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IGluc3RhbmNlOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5hdGl2ZSBsaWJyYXJ5IGZvcm1hdC5cclxuICAgKi9cclxuICByZWFkb25seSBmb3JtYXQ6IE5hdGl2ZUNsaXBwZXJMaWJMb2FkZWRGb3JtYXQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIGNvbnN0cnVjdG9yLiBVc2UgbG9hZE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZUFzeW5jIGluc3RlYWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gaW5zdGFuY2VcclxuICAgKiBAcGFyYW0gZm9ybWF0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoaW5zdGFuY2U6IE5hdGl2ZUNsaXBwZXJMaWJJbnN0YW5jZSwgZm9ybWF0OiBOYXRpdmVDbGlwcGVyTGliTG9hZGVkRm9ybWF0KSB7XHJcbiAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcclxuICAgIHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm1zIGEgcG9seWdvbiBjbGlwcGluZyAoYm9vbGVhbikgb3BlcmF0aW9uLCByZXR1cm5pbmcgdGhlIHJlc3VsdGluZyBQYXRocyBvciB0aHJvd2luZyBhbiBlcnJvciBpZiBmYWlsZWQuXHJcbiAgICpcclxuICAgKiBUaGUgc29sdXRpb24gcGFyYW1ldGVyIGluIHRoaXMgY2FzZSBpcyBhIFBhdGhzIG9yIFBvbHlUcmVlIHN0cnVjdHVyZS4gVGhlIFBhdGhzIHN0cnVjdHVyZSBpcyBzaW1wbGVyIHRoYW4gdGhlIFBvbHlUcmVlIHN0cnVjdHVyZS4gQmVjYXVzZSBvZiB0aGlzIGl0IGlzXHJcbiAgICogcXVpY2tlciB0byBwb3B1bGF0ZSBhbmQgaGVuY2UgY2xpcHBpbmcgcGVyZm9ybWFuY2UgaXMgYSBsaXR0bGUgYmV0dGVyIChpdCdzIHJvdWdobHkgMTAlIGZhc3RlcikuIEhvd2V2ZXIsIHRoZSBQb2x5VHJlZSBkYXRhIHN0cnVjdHVyZSBwcm92aWRlcyBtb3JlXHJcbiAgICogaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJldHVybmVkIHBhdGhzIHdoaWNoIG1heSBiZSBpbXBvcnRhbnQgdG8gdXNlcnMuIEZpcnN0bHksIHRoZSBQb2x5VHJlZSBzdHJ1Y3R1cmUgcHJlc2VydmVzIG5lc3RlZCBwYXJlbnQtY2hpbGQgcG9seWdvbiByZWxhdGlvbnNoaXBzXHJcbiAgICogKGllIG91dGVyIHBvbHlnb25zIG93bmluZy9jb250YWluaW5nIGhvbGVzIGFuZCBob2xlcyBvd25pbmcvY29udGFpbmluZyBvdGhlciBvdXRlciBwb2x5Z29ucyBldGMpLiBBbHNvLCBvbmx5IHRoZSBQb2x5VHJlZSBzdHJ1Y3R1cmUgY2FuIGRpZmZlcmVudGlhdGVcclxuICAgKiBiZXR3ZWVuIG9wZW4gYW5kIGNsb3NlZCBwYXRocyBzaW5jZSBlYWNoIFBvbHlOb2RlIGhhcyBhbiBJc09wZW4gcHJvcGVydHkuIChUaGUgUGF0aCBzdHJ1Y3R1cmUgaGFzIG5vIG1lbWJlciBpbmRpY2F0aW5nIHdoZXRoZXIgaXQncyBvcGVuIG9yIGNsb3NlZC4pXHJcbiAgICogRm9yIHRoaXMgcmVhc29uLCB3aGVuIG9wZW4gcGF0aHMgYXJlIHBhc3NlZCB0byBhIENsaXBwZXIgb2JqZWN0LCB0aGUgdXNlciBtdXN0IHVzZSBhIFBvbHlUcmVlIG9iamVjdCBhcyB0aGUgc29sdXRpb24gcGFyYW1ldGVyLCBvdGhlcndpc2UgYW4gZXhjZXB0aW9uXHJcbiAgICogd2lsbCBiZSByYWlzZWQuXHJcbiAgICpcclxuICAgKiBXaGVuIGEgUG9seVRyZWUgb2JqZWN0IGlzIHVzZWQgaW4gYSBjbGlwcGluZyBvcGVyYXRpb24gb24gb3BlbiBwYXRocywgdHdvIGFuY2lsbGlhcnkgZnVuY3Rpb25zIGhhdmUgYmVlbiBwcm92aWRlZCB0byBxdWlja2x5IHNlcGFyYXRlIG91dCBvcGVuIGFuZFxyXG4gICAqIGNsb3NlZCBwYXRocyBmcm9tIHRoZSBzb2x1dGlvbiAtIE9wZW5QYXRoc0Zyb21Qb2x5VHJlZSBhbmQgQ2xvc2VkUGF0aHNGcm9tUG9seVRyZWUuIFBvbHlUcmVlVG9QYXRocyBpcyBhbHNvIGF2YWlsYWJsZSB0byBjb252ZXJ0IHBhdGggZGF0YSB0byBhIFBhdGhzXHJcbiAgICogc3RydWN0dXJlIChpcnJlc3BlY3RpdmUgb2Ygd2hldGhlciB0aGV5J3JlIG9wZW4gb3IgY2xvc2VkKS5cclxuICAgKlxyXG4gICAqIFRoZXJlIGFyZSBzZXZlcmFsIHRoaW5ncyB0byBub3RlIGFib3V0IHRoZSBzb2x1dGlvbiBwYXRocyByZXR1cm5lZDpcclxuICAgKiAtIHRoZXkgYXJlbid0IGluIGFueSBzcGVjaWZpYyBvcmRlclxyXG4gICAqIC0gdGhleSBzaG91bGQgbmV2ZXIgb3ZlcmxhcCBvciBiZSBzZWxmLWludGVyc2VjdGluZyAoYnV0IHNlZSBub3RlcyBvbiByb3VuZGluZylcclxuICAgKiAtIGhvbGVzIHdpbGwgYmUgb3JpZW50ZWQgb3Bwb3NpdGUgb3V0ZXIgcG9seWdvbnNcclxuICAgKiAtIHRoZSBzb2x1dGlvbiBmaWxsIHR5cGUgY2FuIGJlIGNvbnNpZGVyZWQgZWl0aGVyIEV2ZW5PZGQgb3IgTm9uWmVybyBzaW5jZSBpdCB3aWxsIGNvbXBseSB3aXRoIGVpdGhlciBmaWxsaW5nIHJ1bGVcclxuICAgKiAtIHBvbHlnb25zIG1heSByYXJlbHkgc2hhcmUgYSBjb21tb24gZWRnZSAodGhvdWdoIHRoaXMgaXMgbm93IHZlcnkgcmFyZSBhcyBvZiB2ZXJzaW9uIDYpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGFyYW1zIC0gY2xpcHBpbmcgb3BlcmF0aW9uIGRhdGFcclxuICAgKiBAcmV0dXJuIHtQYXRoc30gLSB0aGUgcmVzdWx0aW5nIFBhdGhzLlxyXG4gICAqL1xyXG4gIGNsaXBUb1BhdGhzKHBhcmFtczogQ2xpcFBhcmFtcyk6IFBhdGhzIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiBjbGlwVG9QYXRocyh0aGlzLmluc3RhbmNlLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybXMgYSBwb2x5Z29uIGNsaXBwaW5nIChib29sZWFuKSBvcGVyYXRpb24sIHJldHVybmluZyB0aGUgcmVzdWx0aW5nIFBvbHlUcmVlIG9yIHRocm93aW5nIGFuIGVycm9yIGlmIGZhaWxlZC5cclxuICAgKlxyXG4gICAqIFRoZSBzb2x1dGlvbiBwYXJhbWV0ZXIgaW4gdGhpcyBjYXNlIGlzIGEgUGF0aHMgb3IgUG9seVRyZWUgc3RydWN0dXJlLiBUaGUgUGF0aHMgc3RydWN0dXJlIGlzIHNpbXBsZXIgdGhhbiB0aGUgUG9seVRyZWUgc3RydWN0dXJlLiBCZWNhdXNlIG9mIHRoaXMgaXQgaXNcclxuICAgKiBxdWlja2VyIHRvIHBvcHVsYXRlIGFuZCBoZW5jZSBjbGlwcGluZyBwZXJmb3JtYW5jZSBpcyBhIGxpdHRsZSBiZXR0ZXIgKGl0J3Mgcm91Z2hseSAxMCUgZmFzdGVyKS4gSG93ZXZlciwgdGhlIFBvbHlUcmVlIGRhdGEgc3RydWN0dXJlIHByb3ZpZGVzIG1vcmVcclxuICAgKiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmV0dXJuZWQgcGF0aHMgd2hpY2ggbWF5IGJlIGltcG9ydGFudCB0byB1c2Vycy4gRmlyc3RseSwgdGhlIFBvbHlUcmVlIHN0cnVjdHVyZSBwcmVzZXJ2ZXMgbmVzdGVkIHBhcmVudC1jaGlsZCBwb2x5Z29uIHJlbGF0aW9uc2hpcHNcclxuICAgKiAoaWUgb3V0ZXIgcG9seWdvbnMgb3duaW5nL2NvbnRhaW5pbmcgaG9sZXMgYW5kIGhvbGVzIG93bmluZy9jb250YWluaW5nIG90aGVyIG91dGVyIHBvbHlnb25zIGV0YykuIEFsc28sIG9ubHkgdGhlIFBvbHlUcmVlIHN0cnVjdHVyZSBjYW4gZGlmZmVyZW50aWF0ZVxyXG4gICAqIGJldHdlZW4gb3BlbiBhbmQgY2xvc2VkIHBhdGhzIHNpbmNlIGVhY2ggUG9seU5vZGUgaGFzIGFuIElzT3BlbiBwcm9wZXJ0eS4gKFRoZSBQYXRoIHN0cnVjdHVyZSBoYXMgbm8gbWVtYmVyIGluZGljYXRpbmcgd2hldGhlciBpdCdzIG9wZW4gb3IgY2xvc2VkLilcclxuICAgKiBGb3IgdGhpcyByZWFzb24sIHdoZW4gb3BlbiBwYXRocyBhcmUgcGFzc2VkIHRvIGEgQ2xpcHBlciBvYmplY3QsIHRoZSB1c2VyIG11c3QgdXNlIGEgUG9seVRyZWUgb2JqZWN0IGFzIHRoZSBzb2x1dGlvbiBwYXJhbWV0ZXIsIG90aGVyd2lzZSBhbiBleGNlcHRpb25cclxuICAgKiB3aWxsIGJlIHJhaXNlZC5cclxuICAgKlxyXG4gICAqIFdoZW4gYSBQb2x5VHJlZSBvYmplY3QgaXMgdXNlZCBpbiBhIGNsaXBwaW5nIG9wZXJhdGlvbiBvbiBvcGVuIHBhdGhzLCB0d28gYW5jaWxsaWFyeSBmdW5jdGlvbnMgaGF2ZSBiZWVuIHByb3ZpZGVkIHRvIHF1aWNrbHkgc2VwYXJhdGUgb3V0IG9wZW4gYW5kXHJcbiAgICogY2xvc2VkIHBhdGhzIGZyb20gdGhlIHNvbHV0aW9uIC0gT3BlblBhdGhzRnJvbVBvbHlUcmVlIGFuZCBDbG9zZWRQYXRoc0Zyb21Qb2x5VHJlZS4gUG9seVRyZWVUb1BhdGhzIGlzIGFsc28gYXZhaWxhYmxlIHRvIGNvbnZlcnQgcGF0aCBkYXRhIHRvIGEgUGF0aHNcclxuICAgKiBzdHJ1Y3R1cmUgKGlycmVzcGVjdGl2ZSBvZiB3aGV0aGVyIHRoZXkncmUgb3BlbiBvciBjbG9zZWQpLlxyXG4gICAqXHJcbiAgICogVGhlcmUgYXJlIHNldmVyYWwgdGhpbmdzIHRvIG5vdGUgYWJvdXQgdGhlIHNvbHV0aW9uIHBhdGhzIHJldHVybmVkOlxyXG4gICAqIC0gdGhleSBhcmVuJ3QgaW4gYW55IHNwZWNpZmljIG9yZGVyXHJcbiAgICogLSB0aGV5IHNob3VsZCBuZXZlciBvdmVybGFwIG9yIGJlIHNlbGYtaW50ZXJzZWN0aW5nIChidXQgc2VlIG5vdGVzIG9uIHJvdW5kaW5nKVxyXG4gICAqIC0gaG9sZXMgd2lsbCBiZSBvcmllbnRlZCBvcHBvc2l0ZSBvdXRlciBwb2x5Z29uc1xyXG4gICAqIC0gdGhlIHNvbHV0aW9uIGZpbGwgdHlwZSBjYW4gYmUgY29uc2lkZXJlZCBlaXRoZXIgRXZlbk9kZCBvciBOb25aZXJvIHNpbmNlIGl0IHdpbGwgY29tcGx5IHdpdGggZWl0aGVyIGZpbGxpbmcgcnVsZVxyXG4gICAqIC0gcG9seWdvbnMgbWF5IHJhcmVseSBzaGFyZSBhIGNvbW1vbiBlZGdlICh0aG91Z2ggdGhpcyBpcyBub3cgdmVyeSByYXJlIGFzIG9mIHZlcnNpb24gNilcclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXJhbXMgLSBjbGlwcGluZyBvcGVyYXRpb24gZGF0YVxyXG4gICAqIEByZXR1cm4ge1BvbHlUcmVlfSAtIHRoZSByZXN1bHRpbmcgUG9seVRyZWUgb3IgdW5kZWZpbmVkLlxyXG4gICAqL1xyXG4gIGNsaXBUb1BvbHlUcmVlKHBhcmFtczogQ2xpcFBhcmFtcyk6IFBvbHlUcmVlIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiBjbGlwVG9Qb2x5VHJlZSh0aGlzLmluc3RhbmNlLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybXMgYSBwb2x5Z29uIG9mZnNldCBvcGVyYXRpb24sIHJldHVybmluZyB0aGUgcmVzdWx0aW5nIFBhdGhzIG9yIHVuZGVmaW5lZCBpZiBmYWlsZWQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBlbmNhcHN1bGF0ZXMgdGhlIHByb2Nlc3Mgb2Ygb2Zmc2V0dGluZyAoaW5mbGF0aW5nL2RlZmxhdGluZykgYm90aCBvcGVuIGFuZCBjbG9zZWQgcGF0aHMgdXNpbmcgYSBudW1iZXIgb2YgZGlmZmVyZW50IGpvaW4gdHlwZXNcclxuICAgKiBhbmQgZW5kIHR5cGVzLlxyXG4gICAqXHJcbiAgICogUHJlY29uZGl0aW9ucyBmb3Igb2Zmc2V0dGluZzpcclxuICAgKiAxLiBUaGUgb3JpZW50YXRpb25zIG9mIGNsb3NlZCBwYXRocyBtdXN0IGJlIGNvbnNpc3RlbnQgc3VjaCB0aGF0IG91dGVyIHBvbHlnb25zIHNoYXJlIHRoZSBzYW1lIG9yaWVudGF0aW9uLCBhbmQgYW55IGhvbGVzIGhhdmUgdGhlIG9wcG9zaXRlIG9yaWVudGF0aW9uXHJcbiAgICogKGllIG5vbi16ZXJvIGZpbGxpbmcpLiBPcGVuIHBhdGhzIG11c3QgYmUgb3JpZW50ZWQgd2l0aCBjbG9zZWQgb3V0ZXIgcG9seWdvbnMuXHJcbiAgICogMi4gUG9seWdvbnMgbXVzdCBub3Qgc2VsZi1pbnRlcnNlY3QuXHJcbiAgICpcclxuICAgKiBMaW1pdGF0aW9uczpcclxuICAgKiBXaGVuIG9mZnNldHRpbmcsIHNtYWxsIGFydGVmYWN0cyBtYXkgYXBwZWFyIHdoZXJlIHBvbHlnb25zIG92ZXJsYXAuIFRvIGF2b2lkIHRoZXNlIGFydGVmYWN0cywgb2Zmc2V0IG92ZXJsYXBwaW5nIHBvbHlnb25zIHNlcGFyYXRlbHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGFyYW1zIC0gb2Zmc2V0IG9wZXJhdGlvbiBwYXJhbXNcclxuICAgKiBAcmV0dXJuIHtQYXRoc3x1bmRlZmluZWR9IC0gdGhlIHJlc3VsdGluZyBQYXRocyBvciB1bmRlZmluZWQgaWYgZmFpbGVkLlxyXG4gICAqL1xyXG4gIG9mZnNldFRvUGF0aHMocGFyYW1zOiBPZmZzZXRQYXJhbXMpOiBQYXRocyB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gb2Zmc2V0VG9QYXRocyh0aGlzLmluc3RhbmNlLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybXMgYSBwb2x5Z29uIG9mZnNldCBvcGVyYXRpb24sIHJldHVybmluZyB0aGUgcmVzdWx0aW5nIFBvbHlUcmVlIG9yIHVuZGVmaW5lZCBpZiBmYWlsZWQuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBlbmNhcHN1bGF0ZXMgdGhlIHByb2Nlc3Mgb2Ygb2Zmc2V0dGluZyAoaW5mbGF0aW5nL2RlZmxhdGluZykgYm90aCBvcGVuIGFuZCBjbG9zZWQgcGF0aHMgdXNpbmcgYSBudW1iZXIgb2YgZGlmZmVyZW50IGpvaW4gdHlwZXNcclxuICAgKiBhbmQgZW5kIHR5cGVzLlxyXG4gICAqXHJcbiAgICogUHJlY29uZGl0aW9ucyBmb3Igb2Zmc2V0dGluZzpcclxuICAgKiAxLiBUaGUgb3JpZW50YXRpb25zIG9mIGNsb3NlZCBwYXRocyBtdXN0IGJlIGNvbnNpc3RlbnQgc3VjaCB0aGF0IG91dGVyIHBvbHlnb25zIHNoYXJlIHRoZSBzYW1lIG9yaWVudGF0aW9uLCBhbmQgYW55IGhvbGVzIGhhdmUgdGhlIG9wcG9zaXRlIG9yaWVudGF0aW9uXHJcbiAgICogKGllIG5vbi16ZXJvIGZpbGxpbmcpLiBPcGVuIHBhdGhzIG11c3QgYmUgb3JpZW50ZWQgd2l0aCBjbG9zZWQgb3V0ZXIgcG9seWdvbnMuXHJcbiAgICogMi4gUG9seWdvbnMgbXVzdCBub3Qgc2VsZi1pbnRlcnNlY3QuXHJcbiAgICpcclxuICAgKiBMaW1pdGF0aW9uczpcclxuICAgKiBXaGVuIG9mZnNldHRpbmcsIHNtYWxsIGFydGVmYWN0cyBtYXkgYXBwZWFyIHdoZXJlIHBvbHlnb25zIG92ZXJsYXAuIFRvIGF2b2lkIHRoZXNlIGFydGVmYWN0cywgb2Zmc2V0IG92ZXJsYXBwaW5nIHBvbHlnb25zIHNlcGFyYXRlbHkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGFyYW1zIC0gb2Zmc2V0IG9wZXJhdGlvbiBwYXJhbXNcclxuICAgKiBAcmV0dXJuIHtQb2x5VHJlZXx1bmRlZmluZWR9IC0gdGhlIHJlc3VsdGluZyBQb2x5VHJlZSBvciB1bmRlZmluZWQgaWYgZmFpbGVkLlxyXG4gICAqL1xyXG4gIG9mZnNldFRvUG9seVRyZWUocGFyYW1zOiBPZmZzZXRQYXJhbXMpOiBQb2x5VHJlZSB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gb2Zmc2V0VG9Qb2x5VHJlZSh0aGlzLmluc3RhbmNlLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLy9ub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xyXG4gIC8qKlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgYXJlYSBvZiB0aGUgc3VwcGxpZWQgcG9seWdvbi4gSXQncyBhc3N1bWVkIHRoYXQgdGhlIHBhdGggaXMgY2xvc2VkIGFuZCBkb2VzIG5vdCBzZWxmLWludGVyc2VjdC4gRGVwZW5kaW5nIG9uIG9yaWVudGF0aW9uLFxyXG4gICAqIHRoaXMgdmFsdWUgbWF5IGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiBJZiBPcmllbnRhdGlvbiBpcyB0cnVlLCB0aGVuIHRoZSBhcmVhIHdpbGwgYmUgcG9zaXRpdmUgYW5kIGNvbnZlcnNlbHksIGlmIE9yaWVudGF0aW9uIGlzIGZhbHNlLCB0aGVuIHRoZVxyXG4gICAqIGFyZWEgd2lsbCBiZSBuZWdhdGl2ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXRoIC0gVGhlIHBhdGhcclxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gQXJlYVxyXG4gICAqL1xyXG4gIGFyZWEocGF0aDogUmVhZG9ubHlQYXRoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBmdW5jdGlvbnMuYXJlYShwYXRoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdmVydGljZXM6XHJcbiAgICogLSB0aGF0IGpvaW4gY28tbGluZWFyIGVkZ2VzLCBvciBqb2luIGVkZ2VzIHRoYXQgYXJlIGFsbW9zdCBjby1saW5lYXIgKHN1Y2ggdGhhdCBpZiB0aGUgdmVydGV4IHdhcyBtb3ZlZCBubyBtb3JlIHRoYW4gdGhlIHNwZWNpZmllZCBkaXN0YW5jZSB0aGUgZWRnZXNcclxuICAgKiB3b3VsZCBiZSBjby1saW5lYXIpXHJcbiAgICogLSB0aGF0IGFyZSB3aXRoaW4gdGhlIHNwZWNpZmllZCBkaXN0YW5jZSBvZiBhbiBhZGphY2VudCB2ZXJ0ZXhcclxuICAgKiAtIHRoYXQgYXJlIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGRpc3RhbmNlIG9mIGEgc2VtaS1hZGphY2VudCB2ZXJ0ZXggdG9nZXRoZXIgd2l0aCB0aGVpciBvdXQtbHlpbmcgdmVydGljZXNcclxuICAgKlxyXG4gICAqIFZlcnRpY2VzIGFyZSBzZW1pLWFkamFjZW50IHdoZW4gdGhleSBhcmUgc2VwYXJhdGVkIGJ5IGEgc2luZ2xlIChvdXQtbHlpbmcpIHZlcnRleC5cclxuICAgKlxyXG4gICAqIFRoZSBkaXN0YW5jZSBwYXJhbWV0ZXIncyBkZWZhdWx0IHZhbHVlIGlzIGFwcHJveGltYXRlbHkg4oiaMiBzbyB0aGF0IGEgdmVydGV4IHdpbGwgYmUgcmVtb3ZlZCB3aGVuIGFkamFjZW50IG9yIHNlbWktYWRqYWNlbnQgdmVydGljZXMgaGF2aW5nIHRoZWlyXHJcbiAgICogY29ycmVzcG9uZGluZyBYIGFuZCBZIGNvb3JkaW5hdGVzIGRpZmZlcmluZyBieSBubyBtb3JlIHRoYW4gMSB1bml0LiAoSWYgdGhlIGVnZGVzIGFyZSBzZW1pLWFkamFjZW50IHRoZSBvdXQtbHlpbmcgdmVydGV4IHdpbGwgYmUgcmVtb3ZlZCB0b28uKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBhdGggLSBUaGUgcGF0aCB0byBjbGVhblxyXG4gICAqIEBwYXJhbSBkaXN0YW5jZSAtIEhvdyBjbG9zZSBwb2ludHMgbmVlZCB0byBiZSBiZWZvcmUgdGhleSBhcmUgY2xlYW5lZFxyXG4gICAqIEByZXR1cm4ge1BhdGh9IC0gVGhlIGNsZWFuZWQgcGF0aFxyXG4gICAqL1xyXG4gIGNsZWFuUG9seWdvbihwYXRoOiBSZWFkb25seVBhdGgsIGRpc3RhbmNlID0gMS4xNDE1KTogUGF0aCB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb25zLmNsZWFuUG9seWdvbih0aGlzLmluc3RhbmNlLCBwYXRoLCBkaXN0YW5jZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHZlcnRpY2VzOlxyXG4gICAqIC0gdGhhdCBqb2luIGNvLWxpbmVhciBlZGdlcywgb3Igam9pbiBlZGdlcyB0aGF0IGFyZSBhbG1vc3QgY28tbGluZWFyIChzdWNoIHRoYXQgaWYgdGhlIHZlcnRleCB3YXMgbW92ZWQgbm8gbW9yZSB0aGFuIHRoZSBzcGVjaWZpZWQgZGlzdGFuY2UgdGhlIGVkZ2VzXHJcbiAgICogd291bGQgYmUgY28tbGluZWFyKVxyXG4gICAqIC0gdGhhdCBhcmUgd2l0aGluIHRoZSBzcGVjaWZpZWQgZGlzdGFuY2Ugb2YgYW4gYWRqYWNlbnQgdmVydGV4XHJcbiAgICogLSB0aGF0IGFyZSB3aXRoaW4gdGhlIHNwZWNpZmllZCBkaXN0YW5jZSBvZiBhIHNlbWktYWRqYWNlbnQgdmVydGV4IHRvZ2V0aGVyIHdpdGggdGhlaXIgb3V0LWx5aW5nIHZlcnRpY2VzXHJcbiAgICpcclxuICAgKiBWZXJ0aWNlcyBhcmUgc2VtaS1hZGphY2VudCB3aGVuIHRoZXkgYXJlIHNlcGFyYXRlZCBieSBhIHNpbmdsZSAob3V0LWx5aW5nKSB2ZXJ0ZXguXHJcbiAgICpcclxuICAgKiBUaGUgZGlzdGFuY2UgcGFyYW1ldGVyJ3MgZGVmYXVsdCB2YWx1ZSBpcyBhcHByb3hpbWF0ZWx5IOKImjIgc28gdGhhdCBhIHZlcnRleCB3aWxsIGJlIHJlbW92ZWQgd2hlbiBhZGphY2VudCBvciBzZW1pLWFkamFjZW50IHZlcnRpY2VzIGhhdmluZyB0aGVpclxyXG4gICAqIGNvcnJlc3BvbmRpbmcgWCBhbmQgWSBjb29yZGluYXRlcyBkaWZmZXJpbmcgYnkgbm8gbW9yZSB0aGFuIDEgdW5pdC4gKElmIHRoZSBlZ2RlcyBhcmUgc2VtaS1hZGphY2VudCB0aGUgb3V0LWx5aW5nIHZlcnRleCB3aWxsIGJlIHJlbW92ZWQgdG9vLilcclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXRocyAtIFRoZSBwYXRocyB0byBjbGVhblxyXG4gICAqIEBwYXJhbSBkaXN0YW5jZSAtIEhvdyBjbG9zZSBwb2ludHMgbmVlZCB0byBiZSBiZWZvcmUgdGhleSBhcmUgY2xlYW5lZFxyXG4gICAqIEByZXR1cm4ge1BhdGhzfSAtIFRoZSBjbGVhbmVkIHBhdGhzXHJcbiAgICovXHJcbiAgY2xlYW5Qb2x5Z29ucyhwYXRoczogUmVhZG9ubHlQYXRocywgZGlzdGFuY2UgPSAxLjE0MTUpOiBQYXRocyB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb25zLmNsZWFuUG9seWdvbnModGhpcy5pbnN0YW5jZSwgcGF0aHMsIGRpc3RhbmNlKTtcclxuICB9XHJcblxyXG4gIC8vbm9pbnNwZWN0aW9uIEpTTWV0aG9kQ2FuQmVTdGF0aWNcclxuICAvKipcclxuICAgKiBUaGlzIGZ1bmN0aW9uIGZpbHRlcnMgb3V0IG9wZW4gcGF0aHMgZnJvbSB0aGUgUG9seVRyZWUgc3RydWN0dXJlIGFuZCByZXR1cm5zIG9ubHkgY2xvc2VkIHBhdGhzIGluIGEgUGF0aHMgc3RydWN0dXJlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBvbHlUcmVlXHJcbiAgICogQHJldHVybiB7UGF0aHN9XHJcbiAgICovXHJcbiAgY2xvc2VkUGF0aHNGcm9tUG9seVRyZWUocG9seVRyZWU6IFBvbHlUcmVlKTogUGF0aHMge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9ucy5jbG9zZWRQYXRoc0Zyb21Qb2x5VHJlZShwb2x5VHJlZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAgTWlua293c2tpIERpZmZlcmVuY2UgaXMgcGVyZm9ybWVkIGJ5IHN1YnRyYWN0aW5nIGVhY2ggcG9pbnQgaW4gYSBwb2x5Z29uIGZyb20gdGhlIHNldCBvZiBwb2ludHMgaW4gYW4gb3BlbiBvciBjbG9zZWQgcGF0aC4gQSBrZXkgZmVhdHVyZSBvZiBNaW5rb3dza2lcclxuICAgKiAgRGlmZmVyZW5jZSBpcyB0aGF0IHdoZW4gaXQncyBhcHBsaWVkIHRvIHR3byBwb2x5Z29ucywgdGhlIHJlc3VsdGluZyBwb2x5Z29uIHdpbGwgY29udGFpbiB0aGUgY29vcmRpbmF0ZSBzcGFjZSBvcmlnaW4gd2hlbmV2ZXIgdGhlIHR3byBwb2x5Z29ucyB0b3VjaCBvclxyXG4gICAqICBvdmVybGFwLiAoVGhpcyBmdW5jdGlvbiBpcyBvZnRlbiB1c2VkIHRvIGRldGVybWluZSB3aGVuIHBvbHlnb25zIGNvbGxpZGUuKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBvbHkxXHJcbiAgICogQHBhcmFtIHBvbHkyXHJcbiAgICogQHJldHVybiB7UGF0aHN9XHJcbiAgICovXHJcbiAgbWlua293c2tpRGlmZihwb2x5MTogUmVhZG9ubHlQYXRoLCBwb2x5MjogUmVhZG9ubHlQYXRoKTogUGF0aHMge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9ucy5taW5rb3dza2lEaWZmKHRoaXMuaW5zdGFuY2UsIHBvbHkxLCBwb2x5Mik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNaW5rb3dza2kgQWRkaXRpb24gaXMgcGVyZm9ybWVkIGJ5IGFkZGluZyBlYWNoIHBvaW50IGluIGEgcG9seWdvbiAncGF0dGVybicgdG8gdGhlIHNldCBvZiBwb2ludHMgaW4gYW4gb3BlbiBvciBjbG9zZWQgcGF0aC4gVGhlIHJlc3VsdGluZyBwb2x5Z29uXHJcbiAgICogKG9yIHBvbHlnb25zKSBkZWZpbmVzIHRoZSByZWdpb24gdGhhdCB0aGUgJ3BhdHRlcm4nIHdvdWxkIHBhc3Mgb3ZlciBpbiBtb3ZpbmcgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIHRoZSBlbmQgb2YgdGhlICdwYXRoJy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXR0ZXJuXHJcbiAgICogQHBhcmFtIHBhdGhcclxuICAgKiBAcGFyYW0gcGF0aElzQ2xvc2VkXHJcbiAgICogQHJldHVybiB7UGF0aHN9XHJcbiAgICovXHJcbiAgbWlua293c2tpU3VtUGF0aChwYXR0ZXJuOiBSZWFkb25seVBhdGgsIHBhdGg6IFJlYWRvbmx5UGF0aCwgcGF0aElzQ2xvc2VkOiBib29sZWFuKTogUGF0aHMge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9ucy5taW5rb3dza2lTdW1QYXRoKHRoaXMuaW5zdGFuY2UsIHBhdHRlcm4sIHBhdGgsIHBhdGhJc0Nsb3NlZCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNaW5rb3dza2kgQWRkaXRpb24gaXMgcGVyZm9ybWVkIGJ5IGFkZGluZyBlYWNoIHBvaW50IGluIGEgcG9seWdvbiAncGF0dGVybicgdG8gdGhlIHNldCBvZiBwb2ludHMgaW4gYW4gb3BlbiBvciBjbG9zZWQgcGF0aC4gVGhlIHJlc3VsdGluZyBwb2x5Z29uXHJcbiAgICogKG9yIHBvbHlnb25zKSBkZWZpbmVzIHRoZSByZWdpb24gdGhhdCB0aGUgJ3BhdHRlcm4nIHdvdWxkIHBhc3Mgb3ZlciBpbiBtb3ZpbmcgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIHRoZSBlbmQgb2YgdGhlICdwYXRoJy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXR0ZXJuXHJcbiAgICogQHBhcmFtIHBhdGhzXHJcbiAgICogQHBhcmFtIHBhdGhJc0Nsb3NlZFxyXG4gICAqIEByZXR1cm4ge1BhdGhzfVxyXG4gICAqL1xyXG4gIG1pbmtvd3NraVN1bVBhdGhzKHBhdHRlcm46IFJlYWRvbmx5UGF0aCwgcGF0aHM6IFJlYWRvbmx5UGF0aHMsIHBhdGhJc0Nsb3NlZDogYm9vbGVhbik6IFBhdGhzIHtcclxuICAgIHJldHVybiBmdW5jdGlvbnMubWlua293c2tpU3VtUGF0aHModGhpcy5pbnN0YW5jZSwgcGF0dGVybiwgcGF0aHMsIHBhdGhJc0Nsb3NlZCk7XHJcbiAgfVxyXG5cclxuICAvL25vaW5zcGVjdGlvbiBKU01ldGhvZENhbkJlU3RhdGljXHJcbiAgLyoqXHJcbiAgICogVGhpcyBmdW5jdGlvbiBmaWx0ZXJzIG91dCBjbG9zZWQgcGF0aHMgZnJvbSB0aGUgUG9seVRyZWUgc3RydWN0dXJlIGFuZCByZXR1cm5zIG9ubHkgb3BlbiBwYXRocyBpbiBhIFBhdGhzIHN0cnVjdHVyZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwb2x5VHJlZVxyXG4gICAqIEByZXR1cm4ge1JlYWRvbmx5UGF0aFtdfVxyXG4gICAqL1xyXG4gIG9wZW5QYXRoc0Zyb21Qb2x5VHJlZShwb2x5VHJlZTogUG9seVRyZWUpOiBSZWFkb25seVBhdGhbXSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb25zLm9wZW5QYXRoc0Zyb21Qb2x5VHJlZShwb2x5VHJlZSk7XHJcbiAgfVxyXG5cclxuICAvL25vaW5zcGVjdGlvbiBKU01ldGhvZENhbkJlU3RhdGljXHJcbiAgLyoqXHJcbiAgICogT3JpZW50YXRpb24gaXMgb25seSBpbXBvcnRhbnQgdG8gY2xvc2VkIHBhdGhzLiBHaXZlbiB0aGF0IHZlcnRpY2VzIGFyZSBkZWNsYXJlZCBpbiBhIHNwZWNpZmljIG9yZGVyLCBvcmllbnRhdGlvbiByZWZlcnMgdG8gdGhlIGRpcmVjdGlvbiAoY2xvY2t3aXNlIG9yXHJcbiAgICogY291bnRlci1jbG9ja3dpc2UpIHRoYXQgdGhlc2UgdmVydGljZXMgcHJvZ3Jlc3MgYXJvdW5kIGEgY2xvc2VkIHBhdGguXHJcbiAgICpcclxuICAgKiBPcmllbnRhdGlvbiBpcyBhbHNvIGRlcGVuZGVudCBvbiBheGlzIGRpcmVjdGlvbjpcclxuICAgKiAtIE9uIFktYXhpcyBwb3NpdGl2ZSB1cHdhcmQgZGlzcGxheXMsIG9yaWVudGF0aW9uIHdpbGwgcmV0dXJuIHRydWUgaWYgdGhlIHBvbHlnb24ncyBvcmllbnRhdGlvbiBpcyBjb3VudGVyLWNsb2Nrd2lzZS5cclxuICAgKiAtIE9uIFktYXhpcyBwb3NpdGl2ZSBkb3dud2FyZCBkaXNwbGF5cywgb3JpZW50YXRpb24gd2lsbCByZXR1cm4gdHJ1ZSBpZiB0aGUgcG9seWdvbidzIG9yaWVudGF0aW9uIGlzIGNsb2Nrd2lzZS5cclxuICAgKlxyXG4gICAqIE5vdGVzOlxyXG4gICAqIC0gU2VsZi1pbnRlcnNlY3RpbmcgcG9seWdvbnMgaGF2ZSBpbmRldGVybWluYXRlIG9yaWVudGF0aW9ucyBpbiB3aGljaCBjYXNlIHRoaXMgZnVuY3Rpb24gd29uJ3QgcmV0dXJuIGEgbWVhbmluZ2Z1bCB2YWx1ZS5cclxuICAgKiAtIFRoZSBtYWpvcml0eSBvZiAyRCBncmFwaGljIGRpc3BsYXkgbGlicmFyaWVzIChlZyBHREksIEdESSssIFhMaWIsIENhaXJvLCBBR0csIEdyYXBoaWNzMzIpIGFuZCBldmVuIHRoZSBTVkcgZmlsZSBmb3JtYXQgaGF2ZSB0aGVpciBjb29yZGluYXRlIG9yaWdpbnNcclxuICAgKiBhdCB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZWlyIHJlc3BlY3RpdmUgdmlld3BvcnRzIHdpdGggdGhlaXIgWSBheGVzIGluY3JlYXNpbmcgZG93bndhcmQuIEhvd2V2ZXIsIHNvbWUgZGlzcGxheSBsaWJyYXJpZXMgKGVnIFF1YXJ0eiwgT3BlbkdMKSBoYXZlIHRoZWlyXHJcbiAgICogY29vcmRpbmF0ZSBvcmlnaW5zIHVuZGVmaW5lZCBvciBpbiB0aGUgY2xhc3NpYyBib3R0b20tbGVmdCBwb3NpdGlvbiB3aXRoIHRoZWlyIFkgYXhlcyBpbmNyZWFzaW5nIHVwd2FyZC5cclxuICAgKiAtIEZvciBOb24tWmVybyBmaWxsZWQgcG9seWdvbnMsIHRoZSBvcmllbnRhdGlvbiBvZiBob2xlcyBtdXN0IGJlIG9wcG9zaXRlIHRoYXQgb2Ygb3V0ZXIgcG9seWdvbnMuXHJcbiAgICogLSBGb3IgY2xvc2VkIHBhdGhzIChwb2x5Z29ucykgaW4gdGhlIHNvbHV0aW9uIHJldHVybmVkIGJ5IHRoZSBjbGlwIG1ldGhvZCwgdGhlaXIgb3JpZW50YXRpb25zIHdpbGwgYWx3YXlzIGJlIHRydWUgZm9yIG91dGVyIHBvbHlnb25zIGFuZCBmYWxzZVxyXG4gICAqIGZvciBob2xlIHBvbHlnb25zICh1bmxlc3MgdGhlIHJldmVyc2VTb2x1dGlvbiBwcm9wZXJ0eSBoYXMgYmVlbiBlbmFibGVkKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXRoIC0gUGF0aFxyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgb3JpZW50YXRpb24ocGF0aDogUmVhZG9ubHlQYXRoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb25zLm9yaWVudGF0aW9uKHBhdGgpO1xyXG4gIH1cclxuXHJcbiAgLy9ub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgUG9pbnRJblBvbHlnb25SZXN1bHQuT3V0c2lkZSB3aGVuIGZhbHNlLCBQb2ludEluUG9seWdvblJlc3VsdC5PbkJvdW5kYXJ5IHdoZW4gcG9pbnQgaXMgb24gcG9seSBhbmQgUG9pbnRJblBvbHlnb25SZXN1bHQuSW5zaWRlIHdoZW4gcG9pbnQgaXMgaW5cclxuICAgKiBwb2x5LlxyXG4gICAqXHJcbiAgICogSXQncyBhc3N1bWVkIHRoYXQgJ3BvbHknIGlzIGNsb3NlZCBhbmQgZG9lcyBub3Qgc2VsZi1pbnRlcnNlY3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9pbnRcclxuICAgKiBAcGFyYW0gcGF0aFxyXG4gICAqIEByZXR1cm4ge1BvaW50SW5Qb2x5Z29uUmVzdWx0fVxyXG4gICAqL1xyXG4gIHBvaW50SW5Qb2x5Z29uKHBvaW50OiBSZWFkb25seTxJbnRQb2ludD4sIHBhdGg6IFJlYWRvbmx5UGF0aCk6IFBvaW50SW5Qb2x5Z29uUmVzdWx0IHtcclxuICAgIHJldHVybiBmdW5jdGlvbnMucG9pbnRJblBvbHlnb24ocG9pbnQsIHBhdGgpO1xyXG4gIH1cclxuXHJcbiAgLy9ub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xyXG4gIC8qKlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gY29udmVydHMgYSBQb2x5VHJlZSBzdHJ1Y3R1cmUgaW50byBhIFBhdGhzIHN0cnVjdHVyZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwb2x5VHJlZVxyXG4gICAqIEByZXR1cm4ge1BhdGhzfVxyXG4gICAqL1xyXG4gIHBvbHlUcmVlVG9QYXRocyhwb2x5VHJlZTogUG9seVRyZWUpOiBQYXRocyB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb25zLnBvbHlUcmVlVG9QYXRocyhwb2x5VHJlZSk7XHJcbiAgfVxyXG5cclxuICAvL25vaW5zcGVjdGlvbiBKU01ldGhvZENhbkJlU3RhdGljXHJcbiAgLyoqXHJcbiAgICogUmV2ZXJzZXMgdGhlIHZlcnRleCBvcmRlciAoYW5kIGhlbmNlIG9yaWVudGF0aW9uKSBpbiB0aGUgc3BlY2lmaWVkIHBhdGguXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGF0aCAtIFBhdGggdG8gcmV2ZXJzZSwgd2hpY2ggZ2V0cyBvdmVyd3JpdHRlbiByYXRoZXIgdGhhbiBjb3BpZWRcclxuICAgKi9cclxuICByZXZlcnNlUGF0aChwYXRoOiBQYXRoKTogdm9pZCB7XHJcbiAgICBmdW5jdGlvbnMucmV2ZXJzZVBhdGgocGF0aCk7XHJcbiAgfVxyXG5cclxuICAvL25vaW5zcGVjdGlvbiBKU01ldGhvZENhbkJlU3RhdGljXHJcbiAgLyoqXHJcbiAgICogUmV2ZXJzZXMgdGhlIHZlcnRleCBvcmRlciAoYW5kIGhlbmNlIG9yaWVudGF0aW9uKSBpbiBlYWNoIGNvbnRhaW5lZCBwYXRoLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBhdGhzIC0gUGF0aHMgdG8gcmV2ZXJzZSwgd2hpY2ggZ2V0IG92ZXJ3cml0dGVuIHJhdGhlciB0aGFuIGNvcGllZFxyXG4gICAqL1xyXG4gIHJldmVyc2VQYXRocyhwYXRoczogUGF0aHMpOiB2b2lkIHtcclxuICAgIGZ1bmN0aW9ucy5yZXZlcnNlUGF0aHMocGF0aHMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBzZWxmLWludGVyc2VjdGlvbnMgZnJvbSB0aGUgc3VwcGxpZWQgcG9seWdvbiAoYnkgcGVyZm9ybWluZyBhIGJvb2xlYW4gdW5pb24gb3BlcmF0aW9uIHVzaW5nIHRoZSBub21pbmF0ZWQgUG9seUZpbGxUeXBlKS5cclxuICAgKiBQb2x5Z29ucyB3aXRoIG5vbi1jb250aWd1b3VzIGR1cGxpY2F0ZSB2ZXJ0aWNlcyAoaWUgJ3RvdWNoaW5nJykgd2lsbCBiZSBzcGxpdCBpbnRvIHR3byBwb2x5Z29ucy5cclxuICAgKlxyXG4gICAqIE5vdGU6IFRoZXJlJ3MgY3VycmVudGx5IG5vIGd1YXJhbnRlZSB0aGF0IHBvbHlnb25zIHdpbGwgYmUgc3RyaWN0bHkgc2ltcGxlIHNpbmNlICdzaW1wbGlmeWluZycgaXMgc3RpbGwgYSB3b3JrIGluIHByb2dyZXNzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBhdGhcclxuICAgKiBAcGFyYW0gZmlsbFR5cGVcclxuICAgKiBAcmV0dXJuIHtQYXRoc30gLSBUaGUgc29sdXRpb25cclxuICAgKi9cclxuICBzaW1wbGlmeVBvbHlnb24ocGF0aDogUmVhZG9ubHlQYXRoLCBmaWxsVHlwZTogUG9seUZpbGxUeXBlID0gUG9seUZpbGxUeXBlLkV2ZW5PZGQpOiBQYXRocyB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb25zLnNpbXBsaWZ5UG9seWdvbih0aGlzLmluc3RhbmNlLCBwYXRoLCBmaWxsVHlwZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHNlbGYtaW50ZXJzZWN0aW9ucyBmcm9tIHRoZSBzdXBwbGllZCBwb2x5Z29ucyAoYnkgcGVyZm9ybWluZyBhIGJvb2xlYW4gdW5pb24gb3BlcmF0aW9uIHVzaW5nIHRoZSBub21pbmF0ZWQgUG9seUZpbGxUeXBlKS5cclxuICAgKiBQb2x5Z29ucyB3aXRoIG5vbi1jb250aWd1b3VzIGR1cGxpY2F0ZSB2ZXJ0aWNlcyAoaWUgJ3ZlcnRpY2VzIGFyZSB0b3VjaGluZycpIHdpbGwgYmUgc3BsaXQgaW50byB0d28gcG9seWdvbnMuXHJcbiAgICpcclxuICAgKiBOb3RlOiBUaGVyZSdzIGN1cnJlbnRseSBubyBndWFyYW50ZWUgdGhhdCBwb2x5Z29ucyB3aWxsIGJlIHN0cmljdGx5IHNpbXBsZSBzaW5jZSAnc2ltcGxpZnlpbmcnIGlzIHN0aWxsIGEgd29yayBpbiBwcm9ncmVzcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXRoc1xyXG4gICAqIEBwYXJhbSBmaWxsVHlwZVxyXG4gICAqIEByZXR1cm4ge1BhdGhzfSAtIFRoZSBzb2x1dGlvblxyXG4gICAqL1xyXG4gIHNpbXBsaWZ5UG9seWdvbnMocGF0aHM6IFJlYWRvbmx5UGF0aHMsIGZpbGxUeXBlOiBQb2x5RmlsbFR5cGUgPSBQb2x5RmlsbFR5cGUuRXZlbk9kZCk6IFBhdGhzIHtcclxuICAgIHJldHVybiBmdW5jdGlvbnMuc2ltcGxpZnlQb2x5Z29ucyh0aGlzLmluc3RhbmNlLCBwYXRocywgZmlsbFR5cGUpO1xyXG4gIH1cclxuXHJcbiAgLy9ub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xyXG4gIC8qKlxyXG4gICAqIFNjYWxlcyBhIHBhdGggYnkgbXVsdGlwbHlpbmcgYWxsIGl0cyBwb2ludHMgYnkgYSBudW1iZXIgYW5kIHRoZW4gcm91bmRpbmcgdGhlbS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXRoIC0gUGF0aCB0byBzY2FsZVxyXG4gICAqIEBwYXJhbSBzY2FsZSAtIFNjYWxlIG11bHRpcGxpZXJcclxuICAgKiBAcmV0dXJuIHtQYXRofSAtIFRoZSBzY2FsZWQgcGF0aFxyXG4gICAqL1xyXG4gIHNjYWxlUGF0aChwYXRoOiBSZWFkb25seVBhdGgsIHNjYWxlOiBudW1iZXIpOiBQYXRoIHtcclxuICAgIHJldHVybiBmdW5jdGlvbnMuc2NhbGVQYXRoKHBhdGgsIHNjYWxlKTtcclxuICB9XHJcblxyXG4gIC8vbm9pbnNwZWN0aW9uIEpTTWV0aG9kQ2FuQmVTdGF0aWNcclxuICAvKipcclxuICAgKiBTY2FsZXMgYWxsIGlubmVyIHBhdGhzIGJ5IG11bHRpcGx5aW5nIGFsbCBpdHMgcG9pbnRzIGJ5IGEgbnVtYmVyIGFuZCB0aGVuIHJvdW5kaW5nIHRoZW0uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGF0aHMgLSBQYXRocyB0byBzY2FsZVxyXG4gICAqIEBwYXJhbSBzY2FsZSAtIFNjYWxlIG11bHRpcGxpZXJcclxuICAgKiBAcmV0dXJuIHtQYXRoc30gLSBUaGUgc2NhbGVkIHBhdGhzXHJcbiAgICovXHJcbiAgc2NhbGVQYXRocyhwYXRoczogUmVhZG9ubHlQYXRocywgc2NhbGU6IG51bWJlcik6IFBhdGhzIHtcclxuICAgIHJldHVybiBmdW5jdGlvbnMuc2NhbGVQYXRocyhwYXRocywgc2NhbGUpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFzeW5jaHJvbm91c2x5IHRyaWVzIHRvIGxvYWQgYSBuZXcgbmF0aXZlIGluc3RhbmNlIG9mIHRoZSBjbGlwcGVyIGxpYnJhcnkgdG8gYmUgc2hhcmVkIGFjcm9zcyBhbGwgbWV0aG9kIGludm9jYXRpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gZm9ybWF0IC0gRm9ybWF0IHRvIGxvYWQsIGVpdGhlciBXYXNtVGhlbkFzbUpzLCBXYXNtT25seSBvciBBc21Kc09ubHkuXHJcbiAqIEByZXR1cm4ge1Byb21pc2U8Q2xpcHBlckxpYldyYXBwZXI+fSAtIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSB3cmFwcGVyIGluc3RhbmNlLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxvYWROYXRpdmVDbGlwcGVyTGliSW5zdGFuY2VBc3luYyA9IGFzeW5jIChcclxuICBmb3JtYXQ6IE5hdGl2ZUNsaXBwZXJMaWJSZXF1ZXN0ZWRGb3JtYXRcclxuKTogUHJvbWlzZTxDbGlwcGVyTGliV3JhcHBlcj4gPT4ge1xyXG4gIC8vIFRPRE86IGluIHRoZSBmdXR1cmUgdXNlIHRoZXNlIG1ldGhvZHMgaW5zdGVhZCBodHRwczovL2dpdGh1Yi5jb20vamVkaXNjdDEvbGlic29kaXVtLmpzL2lzc3Vlcy85NFxyXG5cclxuICBsZXQgdHJ5V2FzbTtcclxuICBsZXQgdHJ5QXNtSnM7XHJcbiAgc3dpdGNoIChmb3JtYXQpIHtcclxuICAgIGNhc2UgTmF0aXZlQ2xpcHBlckxpYlJlcXVlc3RlZEZvcm1hdC5XYXNtV2l0aEFzbUpzRmFsbGJhY2s6XHJcbiAgICAgIHRyeVdhc20gPSB0cnVlO1xyXG4gICAgICB0cnlBc21KcyA9IHRydWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBOYXRpdmVDbGlwcGVyTGliUmVxdWVzdGVkRm9ybWF0Lldhc21Pbmx5OlxyXG4gICAgICB0cnlXYXNtID0gdHJ1ZTtcclxuICAgICAgdHJ5QXNtSnMgPSBmYWxzZTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIE5hdGl2ZUNsaXBwZXJMaWJSZXF1ZXN0ZWRGb3JtYXQuQXNtSnNPbmx5OlxyXG4gICAgICB0cnlXYXNtID0gZmFsc2U7XHJcbiAgICAgIHRyeUFzbUpzID0gdHJ1ZTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgQ2xpcHBlckVycm9yKFwidW5rbm93biBuYXRpdmUgY2xpcHBlciBmb3JtYXRcIik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRNb2R1bGVBc3luYyhcclxuICAgIGluaXRNb2R1bGU6IChvdmVycmlkZXM6IG9iamVjdCkgPT4gTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlIHwgdW5kZWZpbmVkXHJcbiAgKTogUHJvbWlzZTxOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2U+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2U+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgbGV0IGZpbmFsTW9kdWxlOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAvL25vaW5zcGVjdGlvbiBKU1VudXNlZExvY2FsU3ltYm9sc1xyXG4gICAgICBjb25zdCBtb2R1bGVPdmVycmlkZXMgPSB7XHJcbiAgICAgICAgbm9FeGl0UnVudGltZTogdHJ1ZSxcclxuICAgICAgICBwcmVSdW4oKSB7XHJcbiAgICAgICAgICBpZiAoZmluYWxNb2R1bGUpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZShmaW5hbE1vZHVsZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICByZXNvbHZlKGZpbmFsTW9kdWxlKTtcclxuICAgICAgICAgICAgfSwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBxdWl0KGNvZGU6IG51bWJlciwgZXJyOiBFcnJvcikge1xyXG4gICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgZmluYWxNb2R1bGUgPSBpbml0TW9kdWxlKG1vZHVsZU92ZXJyaWRlcyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGlmICh0cnlXYXNtKSB7XHJcbiAgICBpZiAod2FzbU1vZHVsZSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgIC8vIHNraXBcclxuICAgIH0gZWxzZSBpZiAod2FzbU1vZHVsZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgaW5pdE1vZHVsZSA9IHJlcXVpcmUoXCIuL3dhc20vY2xpcHBlci13YXNtXCIpLmluaXQ7XHJcbiAgICAgICAgd2FzbU1vZHVsZSA9IGF3YWl0IGdldE1vZHVsZUFzeW5jKGluaXRNb2R1bGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IENsaXBwZXJMaWJXcmFwcGVyKHdhc21Nb2R1bGUsIE5hdGl2ZUNsaXBwZXJMaWJMb2FkZWRGb3JtYXQuV2FzbSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHdhc21Nb2R1bGUgPSBlcnI7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBuZXcgQ2xpcHBlckxpYldyYXBwZXIod2FzbU1vZHVsZSwgTmF0aXZlQ2xpcHBlckxpYkxvYWRlZEZvcm1hdC5XYXNtKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICh0cnlBc21Kcykge1xyXG4gICAgaWYgKGFzbUpzTW9kdWxlIGluc3RhbmNlb2YgRXJyb3IpIHtcclxuICAgICAgLy8gc2tpcFxyXG4gICAgfSBlbHNlIGlmIChhc21Kc01vZHVsZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgaW5pdE1vZHVsZSA9IHJlcXVpcmUoXCIuL3dhc20vY2xpcHBlclwiKS5pbml0O1xyXG4gICAgICAgIGFzbUpzTW9kdWxlID0gYXdhaXQgZ2V0TW9kdWxlQXN5bmMoaW5pdE1vZHVsZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgQ2xpcHBlckxpYldyYXBwZXIoYXNtSnNNb2R1bGUsIE5hdGl2ZUNsaXBwZXJMaWJMb2FkZWRGb3JtYXQuQXNtSnMpO1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBhc21Kc01vZHVsZSA9IGVycjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBDbGlwcGVyTGliV3JhcHBlcihhc21Kc01vZHVsZSwgTmF0aXZlQ2xpcHBlckxpYkxvYWRlZEZvcm1hdC5Bc21Kcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0aHJvdyBuZXcgQ2xpcHBlckVycm9yKFwiY291bGQgbm90IGxvYWQgbmF0aXZlIGNsaXBwZXIgaW4gdGhlIGRlc2lyZWQgZm9ybWF0XCIpO1xyXG59O1xyXG4iXX0=