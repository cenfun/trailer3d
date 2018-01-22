define(function() {

    'use strict';

    var OptionBase = require("../core/option-base.js");
    var Util = require('../core/util.js');
    var Easing = require('./easing.js');

    var Tween = OptionBase.extend({

        //if stopped then stop everything
        stopped: true,

        //default option
        easing: Easing.Linear.None,
        duration: 100,
        from: 0,
        till: 1,

        initOption: function(option) {
            if (!option) {
                return;
            }
            for (var k in option) {
                if (option.hasOwnProperty(k)) {
                    this[k] = option[k];
                }
            }
            this.initEasing();
        },

        initEasing: function() {
            if (typeof(this.easing) === "string") {
                this.easing = Util.getValue(Easing, this.easing, Easing.Linear.None);
            }
            if (typeof(this.easing) !== "function") {
                this.easing = Easing.Linear.None;
            }
        },

        start: function(option) {

            this.initOption(option);

            this.stopped = false;
            this.data = this.from;
            //init start time
            this.time = null;
            this.trigger("onStart", this.data);
        },

        //update step by step
        update: function() {
            //if call stop in running
            if (this.stopped) {
                return this;
            }

            //====================================
            //update
            if (!this.time) {
                this.time = new Date().getTime();
            }
            var now = new Date().getTime();
            var t = now - this.time;
            var d = this.duration;
            if (t < d) {
                var k = t / d;
                var p = this.easing.call(this, k);
                var data = this.calculate(p, this.from, this.till, this.from);
                //update callback
                this.updateData(data);
                return this;
            }
            //====================================
            //finish
            //last time update callback
            this.updateData(this.till);
            //complete callback
            this.stopped = true;
            this.trigger("onComplete", this.data);
            return this;
        },

        calculate_array: function(p, from, till, self) {
            //if array
            var v = [];
            for (var i = 0, l = from.length; i < l; i++) {
                if (till[i] === undefined || from[i] === self) {
                    v[i] = from[i];
                } else {
                    v[i] = this.calculate(p, from[i], till[i], self);
                }
            }
            return v;
        },

        calculate_object: function(p, from, till, self) {
            //if object
            var v = {};
            for (var k in from) {
                if (till[k] === undefined || from[k] === self) {
                    v[k] = from[k];
                } else {
                    v[k] = this.calculate(p, from[k], till[k], self);
                }
            }
            return v;
        },

        //stop loop calculate if back to self
        calculate: function(p, from, till, self) {

            if (typeof(from) === "object" && typeof(till) === "object") {
                if (from instanceof Array && till instanceof Array) {
                    return this.calculate_array(p, from, till, self);
                } else {
                    return this.calculate_object(p, from, till, self);
                }
            } else if (Util.isnum(from) && Util.isnum(till)) {
                //must be number
                var v = (till - from) * p + from;
                return v;
            } else {
                //just return from value if NOT number
                return from;
            }
        },

        updateData: function(data) {
            this.data = data;
            this.trigger("onUpdate", data);
            return this;
        },

        //user stop
        stop: function() {
            if (this.stopped) {
                return this;
            }
            //force to till info
            if (arguments[0]) {
                this.updateData(this.till);
            }
            //stop everything now
            this.stopped = true;
            this.trigger("onStop", this.data);
            return this;
        },

        toString: function() {
            return "[object Tween]";
        }
    });

    return Tween;

});