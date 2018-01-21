define(function() {

    "use strict";

    var E = {
        MOUSEDOWN: "mousedown",
        MOUSEMOVE: "mousemove",
        MOUSEUP: "mouseup",
        //drag
        DRAG_INIT: "drag_init",
        DRAG_START: "drag_start",
        DRAG_UPDATE: "drag_update",
        DRAG_COMPLETE: "drag_complete"
    };
    var Util = require("./util.js");

    var EventBase = require("./event-base.js");

    //====================================================================================================
    /**
     * @constructor
     * @returns {Drag}
     */

    var Drag = EventBase.extend({

        E: E,
        dragging: false,

        constructor: function() {
            this.init();
        },

        init: function() {
            this.ns = ".drag_" + Util.token(8);
            this.MOUSEMOVE = E.MOUSEMOVE + this.ns;
            this.MOUSEUP = E.MOUSEUP + this.ns;
            this.initOption();
            return this;
        },

        initOption: function() {
            this.option = {
                mouseStartX: 0,
                mouseStartY: 0,
                mousePreviousX: 0,
                mousePreviousY: 0,
                mouseCurrentX: 0,
                mouseCurrentY: 0,
                mouseOffsetX: 0,
                mouseOffsetY: 0,
                mouseMoveX: 0,
                mouseMoveY: 0,
                valid: false,
                state: null
            };
        },

        setOption: function(option) {
            var o = this.option;
            Object.keys(option).forEach(function(k) {
                o[k] = option[k];
            });
            return this;
        },

        updateOption: function(e) {
            //sometimes no event for example force complete previous
            if (!e) {
                return;
            }
            //stop default events
            //just for unselectable, but do not stopPropagation() by return false
            if (e.preventDefault) {
                e.preventDefault();
            }
            var o = this.option;
            //keep previous position
            o.mousePreviousX = o.mouseCurrentX;
            o.mousePreviousY = o.mouseCurrentY;
            //current position
            o.mouseCurrentX = e.pageX;
            o.mouseCurrentY = e.pageY;
            //current offset from start
            o.mouseOffsetX = o.mouseCurrentX - o.mouseStartX;
            o.mouseOffsetY = o.mouseCurrentY - o.mouseStartY;
            //position nothing change
            o.valid = (o.mouseOffsetX === 0 && o.mouseOffsetY === 0) ? false : true;
            //current move offset from previous
            o.mouseMoveX = o.mouseCurrentX - o.mousePreviousX;
            o.mouseMoveY = o.mouseCurrentY - o.mousePreviousY;
            return this;
        },

        //============================================================================

        start: function(option) {

            this.previousHandler();

            this.initOption();
            this.setOption(option);

            var o = this.option;
            if (!o.e) {
                return this;
            }

            //init target to event current target
            if (!o.target) {
                o.target = $(o.e.currentTarget);
            }

            //namespace event type for mouse move
            var holder = $(window);
            holder.unbind(this.ns);

            var self = this;
            //only one so no need ns events
            holder.one(this.MOUSEUP, function(e) {
                holder.unbind(self.ns);
                self.dragCompleteHandler(e);
            });

            //namespaces events
            holder.bind(this.MOUSEMOVE, function(e) {
                self.dragUpdateHandler(e);
            });

            this.dragInitHandler(o.e);

            return this;
        },

        //previous state clean
        previousHandler: function() {
            //if previous valid and do NOT complete then force to complete
            var o = this.option;
            if (o.valid && o.state !== E.DRAG_COMPLETE) {
                this.dragCompleteHandler();
            }
        },

        preventDefault: function(e) {
            if (e && e.preventDefault) {
                e.preventDefault();
            }
        },

        //============================================================================

        dragInitHandler: function(e) {
            var o = this.option;
            //start position
            o.mouseStartX = e.pageX;
            o.mouseStartY = e.pageY;
            o.mouseCurrentX = o.mouseStartX;
            o.mouseCurrentY = o.mouseStartY;
            o.valid = false;
            //mouse down but not drag start because the positon do not change
            this.dragging = false;
            //stop select
            this.preventDefault(e);
            o.state = E.DRAG_INIT;
            this.trigger(E.DRAG_INIT, o);
            return this;
        },

        dragUpdateHandler: function(e) {
            this.updateOption(e);
            var o = this.option;
            //already start or update
            if (o.state === E.DRAG_START || o.state === E.DRAG_UPDATE) {
                //drag when mouse move after drag start
                this.preventDefault(e);
                o.state = E.DRAG_UPDATE;
                this.trigger(E.DRAG_UPDATE, o);
                return this;
            }

            if (!o.valid) {
                return this;
            }

            //drag start when mouse move first time 
            this.dragging = true;
            this.preventDefault(e);
            o.state = E.DRAG_START;
            this.trigger(E.DRAG_START, o);
            return this;
        },

        dragCompleteHandler: function(e) {
            this.updateOption(e);
            var o = this.option;
            //always complete, but valid could be true or false
            this.dragging = false;
            this.preventDefault(e);
            o.state = E.DRAG_COMPLETE;
            this.trigger(E.DRAG_COMPLETE, o);
            return this;
        },

        //class print
        toString: function() {
            return "[object Drag]";
        }

    });


    return Drag;

});