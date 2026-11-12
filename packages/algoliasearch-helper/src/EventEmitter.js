'use strict';

/**
 * A minimal version of Node's EventEmitter.
 * Subclasses don't have to call the constructor: `_events` is created lazily.
 * @class
 */
function EventEmitter() {}

EventEmitter.prototype.on = EventEmitter.prototype.addListener = function (
  type,
  listener
) {
  var events = this._events || (this._events = Object.create(null));
  (events[type] || (events[type] = [])).push(listener);
  return this;
};

EventEmitter.prototype.once = function (type, listener) {
  var fired = false;

  function wrapper() {
    this.removeListener(type, wrapper);
    // A listener emitting the same event can reach this wrapper again
    // through the copy of the listeners taken by the outer `emit`.
    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  wrapper.listener = listener;
  return this.on(type, wrapper);
};

EventEmitter.prototype.removeListener = function (type, listener) {
  var list = this._events && this._events[type];
  if (!list || !listener) return this;

  for (var i = list.length - 1; i >= 0; i--) {
    if (list[i] === listener || list[i].listener === listener) {
      list.splice(i, 1);
      break;
    }
  }

  if (!list.length) delete this._events[type];
  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  if (!this._events) return this;

  if (arguments.length === 0) {
    this._events = Object.create(null);
  } else {
    delete this._events[type];
  }
  return this;
};

EventEmitter.prototype.listeners = function (type) {
  var list = this._events && this._events[type];
  return list ? list.slice() : [];
};

EventEmitter.prototype.listenerCount = function (type) {
  var list = this._events && this._events[type];
  return list ? list.length : 0;
};

EventEmitter.prototype.emit = function (type) {
  var list = this.listeners(type);
  var args = Array.prototype.slice.call(arguments, 1);

  if (type === 'error' && !list.length) {
    var error = args[0];
    if (error instanceof Error) throw error;
    var wrapped = new Error('Unhandled "error" event (' + error + ')');
    wrapped.context = error;
    throw wrapped;
  }

  for (var i = 0; i < list.length; i++) {
    list[i].apply(this, args);
  }
  return list.length > 0;
};

module.exports = EventEmitter;
