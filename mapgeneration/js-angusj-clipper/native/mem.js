"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mallocDoubleArray(nativeClipperLib, len) {
    var nofBytes = len * Float64Array.BYTES_PER_ELEMENT;
    var ptr = nativeClipperLib._malloc(nofBytes);
    return new Float64Array(nativeClipperLib.HEAPF64.buffer, ptr, len);
}
exports.mallocDoubleArray = mallocDoubleArray;
function freeTypedArray(nativeClipperLib, array) {
    nativeClipperLib._free(array.byteOffset);
}
exports.freeTypedArray = freeTypedArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL25hdGl2ZS9tZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxTQUFnQixpQkFBaUIsQ0FDL0IsZ0JBQTBDLEVBQzFDLEdBQVc7SUFFWCxJQUFNLFFBQVEsR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixDQUFDO0lBQ3RELElBQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxPQUFPLElBQUksWUFBWSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFQRCw4Q0FPQztBQUVELFNBQWdCLGNBQWMsQ0FDNUIsZ0JBQTBDLEVBQzFDLEtBQWlDO0lBRWpDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUxELHdDQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlIH0gZnJvbSBcIi4vTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFsbG9jRG91YmxlQXJyYXkoXHJcbiAgbmF0aXZlQ2xpcHBlckxpYjogTmF0aXZlQ2xpcHBlckxpYkluc3RhbmNlLFxyXG4gIGxlbjogbnVtYmVyXHJcbik6IEZsb2F0NjRBcnJheSB7XHJcbiAgY29uc3Qgbm9mQnl0ZXMgPSBsZW4gKiBGbG9hdDY0QXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XHJcbiAgY29uc3QgcHRyID0gbmF0aXZlQ2xpcHBlckxpYi5fbWFsbG9jKG5vZkJ5dGVzKTtcclxuICByZXR1cm4gbmV3IEZsb2F0NjRBcnJheShuYXRpdmVDbGlwcGVyTGliLkhFQVBGNjQuYnVmZmVyLCBwdHIsIGxlbik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmcmVlVHlwZWRBcnJheShcclxuICBuYXRpdmVDbGlwcGVyTGliOiBOYXRpdmVDbGlwcGVyTGliSW5zdGFuY2UsXHJcbiAgYXJyYXk6IEZsb2F0NjRBcnJheSB8IFVpbnQzMkFycmF5XHJcbik6IHZvaWQge1xyXG4gIG5hdGl2ZUNsaXBwZXJMaWIuX2ZyZWUoYXJyYXkuYnl0ZU9mZnNldCk7XHJcbn1cclxuIl19