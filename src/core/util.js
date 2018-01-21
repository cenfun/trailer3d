define(function() {
    'use strict';

    var isObject = require('./is-object.js');
    var merge = require('./merge.js');

    var Util = {

        isObject: isObject,
        merge: merge,

        //=================================================================================
        //strings
        //get a token string
        token: function(len) {
            var str = Math.random().toString().substr(2);
            if (len) {
                str = str.substr(0, Util.tonum(len));
            }
            return str;
        },

        //=================================================================================
        //number
        //if is valid number
        isnum: function(num) {
            if (typeof(num) !== "number" || isNaN(num)) {
                return false;
            }
            var isInvalid = function(n) {
                if (n === Number.MAX_VALUE || n === Number.MIN_VALUE || n === Number.NEGATIVE_INFINITY || n === Number.POSITIVE_INFINITY) {
                    return true;
                }
                return false;
            };
            if (isInvalid(num)) {
                return false;
            }
            return true;
        },
        // format to a valid number
        tonum: function(num, toInt) {
            if (typeof(num) !== "number") {
                num = parseFloat(num);
            }
            if (isNaN(num)) {
                num = 0;
            }
            if (toInt) {
                num = Math.round(num);
            }
            return num;
        },

        //try to convert number if it is a string number
        convertNum: function(str) {
            if (typeof(str) === "string") {
                //keep string if can not be converted
                var reg = /^[-+]?\d+(\.\d+)?$/ig;
                if (reg.test(str)) {
                    return parseFloat(str);
                }
            }
            return str;
        },

        clamp: function(num, min, max) {
            return Math.max(Math.min(num, max), min);
        },

        per: function(num) {
            num = Util.tonum(num);
            num = Util.clamp(num, 0, 1);
            return num;
        },

        //whether data is array with length
        isarr: function(data) {
            if (data && data instanceof Array) {
                return true;
            }
            return false;
        },

        tolist: function(data) {
            if (!data) {
                return [];
            }
            if (data instanceof Array) {
                return data;
            }
            return [data];
        },

        islist: function(data) {
            if (Util.isarr(data) && data.length > 0) {
                return true;
            }
            return false;
        },
        //whether item in list
        inlist: function(item, list) {
            if (!Util.islist(list)) {
                return false;
            }

            for (var i = 0, l = list.length; i < l; i++) {
                if (list[i] === item) {
                    return true;
                }
            }

            return false;
        },

        listToMap: function(list) {
            var map = {};
            if (Util.islist(list)) {
                list.forEach(function(item) {
                    map[item] = true;
                });
            }
            return map;
        },

        isdate: function(date) {
            if (!date || !(date instanceof Date)) {
                return false;
            }
            //is Date Object but Date {Invalid Date}
            if (isNaN(date.getTime())) {
                return false;
            }
            return true;
        },

        //getValue({a:{b:1}}, "a.b", 0)
        getValue: function(data, path, defaultValue) {
            if (!path) {
                return defaultValue;
            }
            var current = data;
            var list = path.split(".");
            var lastKey = list.pop();
            while (current && list.length) {
                var item = list.shift();
                current = current[item];
            }
            if (current && current.hasOwnProperty(lastKey)) {
                var value = current[lastKey];
                if (typeof(value) !== "undefined") {
                    return value;
                }
            }
            return defaultValue;
        },

        isMatch: function(item, attr) {
            if (!item || !attr) {
                return false;
            }
            for (var k in attr) {
                if (item[k] !== attr[k]) {
                    return false;
                }
            }
            return true;
        },

        getListItem: function(list, attr) {
            if (Util.islist(list)) {
                for (var i = 0, l = list.length; i < l; i++) {
                    var item = list[i];
                    if (Util.isMatch(item, attr)) {
                        return item;
                    }
                }
            }
            return null;
        },

        delListItem: function(list, attr) {
            if (!Util.islist(list)) {
                return list;
            }
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (Util.isMatch(item, attr)) {
                    list.splice(i, 1);
                    i--;
                }
            }
            return list;
        },

        removeTimeout: function(target) {
            if (!target) {
                return;
            }
            //remove all timeout
            for (var k in target) {
                if (k.indexOf("timeout_") === 0 && typeof(target[k]) === "number") {
                    clearTimeout(target[k]);
                }
            }
        },

        removePrevious: function(target) {
            if (!target) {
                return;
            }
            //remove all previous property
            for (var k in target) {
                if (k.indexOf("previous") === 0) {
                    delete target[k];
                }
            }
        }

    };

    return Util;

});