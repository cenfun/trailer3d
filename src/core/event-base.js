define(function() {
    "use strict";

    var Extend = require("./extend.js");

    //=====================================================================================
    var Event = function(o) {
        this.type = o.type;
        this.data = o.data;
        this.target = o.target;
        this.currentTarget = o.target;
        this.delegateTarget = o.target;
        this.timeStamp = new Date().getTime();
    };

    Event.prototype = {
        constructor: Event,
        isDefaultPrevented: false,
        isPropagationStopped: false,
        isImmediatePropagationStopped: false,
        preventDefault: function() {
            this.isDefaultPrevented = true;
        },
        stopPropagation: function() {
            this.isPropagationStopped = true;
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = true;
            this.stopPropagation();
        }
    };

    //=====================================================================================
    function getEventItem(context, handler, option) {
        context += "";
        if (!context) {
            return null;
        }
        option = option || {};
        var arr = context.split(".");
        var type = arr.shift();
        var namespace = "";
        if (arr.length) {
            namespace = arr.join(".");
        }
        var eventItem = {
            context: context,
            type: type,
            namespace: namespace,
            handler: handler,
            one: option.one,
            prepend: option.prepend,
            defaultEvent: option.defaultEvent
        };
        return eventItem;
    }

    function getEventList(types, handler, option) {
        if (!types) {
            return [];
        }

        if (handler && typeof(handler) === "object") {
            option = handler;
        }
        var list = [];

        if (typeof(types) === "object") {
            var keys = Object.keys(types);
            keys.forEach(function(type) {
                var eventItem = getEventItem(type, types[type], option);
                if (eventItem) {
                    list.push(eventItem);
                }
            });
            return list;
        }

        if (typeof(types) === "string") {
            var arr = types.split(" ");
            arr.forEach(function(type) {
                var eventItem = getEventItem(type, handler, option);
                if (eventItem) {
                    list.push(eventItem);
                }
            });
        }
        return list;
    }

    //=====================================================================================
    function addEvent(eventListener, event, maxListeners) {
        if (event.defaultEvent) {
            eventListener.defaultEvent = event;
            return;
        }
        if (eventListener.events.length >= maxListeners) {
            var msg = "Possible Event memory leak detected. ";
            msg += "More than " + maxListeners + " (max limit) listeners added. ";
            msg += "Use setMaxListeners(n) to increase limit.";
            console.warn(msg);
            return;
        }
        if (event.prepend) {
            eventListener.events.unshift(event);
        } else {
            eventListener.events.push(event);
        }
    }

    function addEvents(eventListeners, eventList, maxListeners) {
        eventList.forEach(function(event) {
            var type = event.type;
            if (typeof(eventListeners[type]) === "undefined") {
                eventListeners[type] = {
                    events: [],
                    defaultEvent: null
                };
            }
            var handler = event.handler;
            if (typeof(handler) !== "function") {
                return;
            }
            var eventListener = eventListeners[type];
            addEvent(eventListener, event, maxListeners);
        });
    }

    //=====================================================================================

    function removeEventByDefault(eventListeners, type) {
        var eventListener = eventListeners[type];
        if (!eventListener) {
            return;
        }
        if (eventListener.defaultEvent) {
            eventListener.defaultEvent = null;
        }
    }

    function removeEventByNamespace(eventListeners, namespace) {
        var types = Object.keys(eventListeners);
        types.forEach(function(type) {
            var eventListener = eventListeners[type];
            var events = eventListener.events;
            for (var i = 0; i < events.length; i++) {
                var item = events[i];
                if (item && item.namespace === namespace) {
                    events.splice(i, 1);
                    i--;
                }
            }
        });
    }

    function removeEventByHandler(eventListeners, type, handler) {
        var eventListener = eventListeners[type];
        if (!eventListener) {
            return;
        }
        var events = eventListener.events;
        for (var i = 0; i < events.length; i++) {
            var item = events[i];
            if (item && item.handler === handler) {
                events.splice(i, 1);
                i--;
            }
        }
    }

    function removeEventByType(eventListeners, type) {
        var eventListener = eventListeners[type];
        if (!eventListener) {
            return;
        }
        if (eventListener.defaultEvent) {
            eventListener.events = [];
        } else {
            delete eventListeners[type];
        }
    }

    function removeEvent(eventListeners, event) {
        var type = event.type;
        if (event.defaultEvent) {
            removeEventByDefault(eventListeners, type);
            return;
        }
        var namespace = event.namespace;
        if (!type && namespace) {
            removeEventByNamespace(eventListeners, namespace);
            return;
        }
        var handler = event.handler;
        if (typeof(handler) === "function") {
            removeEventByHandler(eventListeners, type, handler);
            return;
        }
        removeEventByType(eventListeners, type);
    }

    function removeEvents(eventListeners, eventList) {
        eventList.forEach(function(event) {
            removeEvent(eventListeners, event);
        });
    }

    function removeAllEvents(eventListeners) {
        var types = Object.keys(eventListeners);
        types.forEach(function(type) {
            removeEventByType(eventListeners, type);
        });
    }

    //=====================================================================================
    function sendEventList(eventListener, event, target, data) {
        var events = eventListener.events;
        for (var i = 0; i < events.length; i++) {
            var item = events[i];
            event.handleObj = item;
            event.namespace = item.namespace;
            item.handler.call(target, event, data);
            if (item.one) {
                events.splice(i, 1);
                i--;
            }
            if (event.isPropagationStopped) {
                break;
            }
        }
    }

    function sendEventDefault(eventListener, event, target, data) {
        var defaultEvent = eventListener.defaultEvent;
        if (!defaultEvent || event.isDefaultPrevented) {
            return;
        }
        defaultEvent.handler.call(target, event, data);
    }

    function sendEvent(eventListeners, type, data, target) {
        var eventListener = eventListeners[type];
        if (!eventListener) {
            return;
        }
        var event = new Event({
            type: type,
            target: target,
            data: data
        });
        sendEventList(eventListener, event, target, data);
        sendEventDefault(eventListener, event, target, data);
    }

    //=====================================================================================
    var EventBase = Extend.extend({

        maxListeners: 10,

        setMaxListeners: function(n) {
            this.maxListeners = Number(n) || 10;
        },

        getMaxListeners: function() {
            return this.maxListeners;
        },

        getEventListeners: function() {
            if (!this.eventListeners) {
                this.eventListeners = {};
            }
            return this.eventListeners;
        },

        //=======================================================

        bind: function(types, handler, option) {
            var eventList = getEventList(types, handler, option);
            if (!eventList.length) {
                return this;
            }
            var eventListeners = this.getEventListeners();
            addEvents(eventListeners, eventList, this.maxListeners);
            return this;
        },

        on: function() {
            return this.bind.apply(this, arguments);
        },

        //=======================================================

        one: function(types, handler) {
            this.bind(types, handler, {
                one: true
            });
            return this;
        },

        once: function() {
            return this.one.apply(this, arguments);
        },

        //=======================================================

        unbind: function(types, handler, option) {
            var eventListeners = this.getEventListeners();
            if (!arguments.length) {
                removeAllEvents(eventListeners);
                return this;
            }
            var eventList = getEventList(types, handler, option);
            if (!eventList.length) {
                return this;
            }
            removeEvents(eventListeners, eventList);
            return this;
        },

        off: function() {
            return this.unbind.apply(this, arguments);
        },

        //=======================================================

        trigger: function(type, data) {
            var eventListeners = this.getEventListeners();
            sendEvent(eventListeners, type, data, this);
            return this;
        },

        emit: function() {
            return this.trigger.apply(this, arguments);
        },

        //=======================================================

        toString: function() {
            return "[object EventBase]";
        }

    });

    return EventBase;

});