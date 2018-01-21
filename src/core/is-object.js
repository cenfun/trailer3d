define(function() {

    "use strict";

    //if is plain object or array
    var isObject = function(obj) {
        if (!obj || typeof(obj) !== "object" || typeof(obj.constructor) !== "function") {
            return false;
        }
        var isAO = function(o) {
            //remove d3 object
            if (o.attr) {
                return false;
            }
            //does not need toString in Array
            if (o.constructor === Array) {
                return true;
            }
            if (o.constructor === Object && typeof(o.toString) === "function" && o.toString() === "[object Object]") {
                //remove like Math Window ...
                return true;
            }
            return false;
        };

        if (isAO(obj)) {
            return true;
        }

        return false;
    };

    return isObject;

});