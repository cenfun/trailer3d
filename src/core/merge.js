define(function() {

    "use strict";

    var isObject = require('./is-object.js');

    //merge JSON
    var merge = function() {
        var arg = arguments;
        var len = arg.length;
        //no parameters
        if (!len) {
            return {};
        }
        //deep merge depend on last parameter 
        var deep = true;
        if (arg[len - 1] === false) {
            deep = false;
        }

        //===================================

        var mergeArray = function(item, base) {
            //merge array to base
            var size = item.length;
            for (var k = 0; k < size; k++) {
                var vk = item[k];
                if (deep && isObject(vk)) {
                    base[k] = merge(base[k], vk);
                } else {
                    base[k] = vk;
                }
            }
            //length fixing for array
            base.length = size;
        };

        var mergeObject = function(item, base) {
            //merge object to base
            Object.keys(item).forEach(function(n) {
                var v = item[n];
                if (base.hasOwnProperty(n) && deep && isObject(v)) {
                    base[n] = merge(base[n], v);
                } else {
                    base[n] = v;
                }
            });
        };

        var mergeAO = function(item, base) {
            //merge to base
            if (item instanceof Array) {
                mergeArray(item, base);
            } else {
                mergeObject(item, base);
            }
        };

        var mergeList = function() {
            //base merge result
            var base = null;
            for (var i = 0; i < len; i++) {
                var item = arg[i];
                //only for valid object or array
                if (!isObject(item)) {
                    continue;
                }
                //base type depend on first parameter
                if (base === null) {
                    base = (item instanceof Array) ? [] : {};
                }
                mergeAO(item, base);
            }
            return base;
        };

        var base = mergeList();

        return base;
    };

    return merge;

});