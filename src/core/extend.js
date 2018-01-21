define(function() {
    "use strict";

    function mergeProps(target, list) {
        for (var i = 0, l = list.length; i < l; i++) {
            var item = list[i];
            if (!item) {
                continue;
            }
            for (var k in item) {
                if (target[k] !== item[k]) {
                    target[k] = item[k];
                }
            }
        }
        return target;
    }

    var Extend = function() {

    };

    Extend.extend = function(protoProps, staticProps) {

        var Super = this;

        //============================================================
        //constructor
        var Sub = function() {
            return Super.apply(this, arguments);
        };

        //if custom constructor
        if (protoProps && protoProps.hasOwnProperty("constructor") && typeof(protoProps.constructor) === 'function') {
            Sub = protoProps.constructor;
        }

        //============================================================

        //add static properties to the constructor
        mergeProps(Sub, [Super, staticProps]);

        //============================================================
        //prototype handler

        var parentProps = Object.create(Super.prototype);
        parentProps.constructor = Sub;

        mergeProps(Sub.prototype, [parentProps, protoProps]);

        //============================================================

        return Sub;

    };

    Extend.mixin = function() {
        var protoProps = mergeProps({}, arguments);
        return Extend.extend.call(this, protoProps);
    };

    return Extend;

});