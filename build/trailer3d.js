(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("trailer3d", [], factory);
	else if(typeof exports === 'object')
		exports["trailer3d"] = factory();
	else
		root["trailer3d"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var Trailer3D = __webpack_require__(1);

window.Trailer3D = Trailer3D;

module.exports = Trailer3D;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
    "use strict";

    var Trailer3D = function(container) {
        if (!container) {
            container = document.createElement("div");
            container.style.width = "100%";
            container.style.height = "100%";
            document.body.appendChild(container);
        }
        this.container = container;
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.resize();
    };

    Trailer3D.prototype = {

        completed: false,

        start: function(story) {
            this.completed = false;
            this.initStory(story);
            if (!this.story.length) {
                return;
            }
            this.play();
        },

        play: function() {

        },

        stop: function() {

        },

        initStory: function(story) {
            this.story = [];
            if (!story || !story.length) {
                return;
            }
            for (var i = 0, l = story.length; i < l; i++) {
                var item = story[i];
                if (!item) {
                    continue;
                }
                this.initItem(item);
            }
        },

        initItem: function(item) {
            var defaultItem = {
                delay: 0,
                duration: 0,
                content: "",
                font: "bold 20px Arial",
                type: "text"
            };

            for (var k in defaultItem) {
                if (typeof(item[k]) === "undefined") {
                    item[k] = defaultItem[k];
                }
            }

            var shape = this.createShape(item);
            if (!shape) {
                return;
            }
            item.shape = shape;
            this.story.push(item);
        },

        createShape: function(item) {
            //===========================================
            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.top = "0px";
            div.style.left = "0px";
            div.style.color = "#ff0000";
            div.style.font = item.font;
            div.style.zIndex = 10;
            div.innerText = item.content;
            this.container.appendChild(div);
            //===========================================

            var width = div.clientWidth;
            var height = div.clientHeight;

            this.container.removeChild(div);

            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.style.position = "absolute";
            canvas.style.top = "0px";
            canvas.style.left = "0px";
            canvas.style.background = "#f5f5f5";
            this.container.appendChild(canvas);

            var ctx = canvas.getContext('2d');
            ctx.font = item.font;
            //all center to fix padding
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText(item.content, width * 0.5, height * 0.5);

            var shapeData = [];

            var imageData = ctx.getImageData(0, 0, width, height);
            var dataList = imageData.data;

            console.log("width,height,area(w*h)", width, height, width * height);
            console.log("area*4(rgba)", dataList.length, width * height * 4);

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var i = (y * width + x) * 4;
                    //console.log(x, y, i);
                    var r = dataList[i];
                    var g = dataList[i + 1];
                    var b = dataList[i + 2];
                    var a = dataList[i + 3];
                    //console.log(r, g, b, a);
                    //black color, alpha !== 0
                    if (a !== 0) {
                        //test red
                        dataList[i] = 255;
                        //dataList[i + 1] = 255;
                        //dataList[i + 2] = 255;
                        //dataList[i + 3] = 255;
                        //console.log(a);
                        var opacity = Number((a / 255).toFixed(2));
                        //console.log(opacity);
                        shapeData.push({
                            color: 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')',
                            opacity: opacity,
                            x: x,
                            y: y
                        });
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            console.log("shapeData", shapeData.length);
            var shape = {
                width: width,
                height: height,
                shapeData: shapeData
            };
            return shape;
        },

        resize: function() {
            var w = this.container.clientWidth;
            var h = this.container.clientHeight;
            this.canvas.width = w;
            this.canvas.height = h;
        }

    };


    return Trailer3D;

}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ })
/******/ ]);
});
//# sourceMappingURL=trailer3d.js.map