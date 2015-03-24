(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.algoliasearchHelper = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AlgoliaSearchHelper = require( './src/algoliasearch.helper' );
/**
 * Algolia Search Helper providing faceting and disjunctive faceting
 * @param {AlgoliaSearch} client - An AlgoliaSearch client
 * @param {string} index - The index name to query
 * @param {Object} [opts] an associative array defining the hitsPerPage, list of facets, the list of disjunctive facets and the default facet filters
 */
function helper( client, index, opts ) {
  return new AlgoliaSearchHelper( client, index, opts );
}

module.exports = helper;

},{"./src/algoliasearch.helper":7}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"_process":4,"inherits":3}],7:[function(require,module,exports){
"use strict";
var extend = require( "./functions/extend" );
var util = require( "util" );
var events = require( "events" );

/**
 * Initialize a new AlgoliaSearchHelper
 * @param  {AlgoliaSearch} client an AlgoliaSearch client
 * @param  {string} index the index name to query
 * @param  {hash} options an associative array defining the hitsPerPage, list of facets and list of disjunctive facets
 */
function AlgoliaSearchHelper( client, index, options ) {
  var defaults = AlgoliaSearchHelper.optionsDefaults;
  var optionsWithDefaults = extend( {}, defaults, options );

  this.client = client;
  this.index = index;
  this.options = optionsWithDefaults;

  this.page = 0;
  this.refinements = {};
  this.excludes = {};
  this.disjunctiveRefinements = {};
  this.extraQueries = [];
}

util.inherits( AlgoliaSearchHelper, events.EventEmitter );

AlgoliaSearchHelper.optionsDefaults = {
  // list of facets to compute
  facets : [],
  // list of disjunctive facets to compute
  disjunctiveFacets : [],
  // number of hits per page
  hitsPerPage : 20,
  // the default list of facetFilters
  defaultFacetFilters : []
};

/**
 * Perform a query
 * @param  {string} q the user query
 * @param  {function} searchCallback the result callback called with two arguments:
 *  err : an error is something wrong occured or null
 *  content: the query answer with an extra 'disjunctiveFacets' attribute
 * @param  {object} searchParams contains options to pass to the inner algolia client
 * @return {undefined | Promise} If a callback is provided then it returns
 *  undefined, otherwise it gives the results through a promise.
 */
AlgoliaSearchHelper.prototype.search = function( q, searchParams ) {
  this.q = q;
  this.searchParams = searchParams || {};
  this.page = this.page || 0;
  this.refinements = this.refinements || {};
  this.disjunctiveRefinements = this.disjunctiveRefinements || {};
  return this._search();
};

/**
 * Remove all refinements (disjunctive + conjunctive)
 */
AlgoliaSearchHelper.prototype.clearRefinements = function() {
  this.disjunctiveRefinements = {};
  this.refinements = {};
};

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.addDisjunctiveRefine = function( facet, value ) {
  this.disjunctiveRefinements = this.disjunctiveRefinements || {};
  this.disjunctiveRefinements[ facet ] = this.disjunctiveRefinements[ facet ] || {};
  this.disjunctiveRefinements[ facet ][ value ] = true;
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.removeDisjunctiveRefine = function( facet, value ) {
  this.disjunctiveRefinements = this.disjunctiveRefinements || {};
  this.disjunctiveRefinements[facet] = this.disjunctiveRefinements[facet] || {};
  try {
    delete this.disjunctiveRefinements[facet][value];
  }
  catch ( error ) {
    this.disjunctiveRefinements[facet][value] = undefined; // IE compat
  }
};

/**
 * Ensure a facet refinement exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.addRefine = function( facet, value ) {
  var refinement = facet + ":" + value;
  this.refinements = this.refinements || {};
  this.refinements[refinement] = true;
};

/**
 * Ensure a facet refinement does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.removeRefine = function( facet, value ) {
  var refinement = facet + ":" + value;
  this.refinements = this.refinements || {};
  this.refinements[refinement] = false;
};

/**
 * Ensure a facet exclude exists
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.addExclude = function( facet, value ) {
  var refinement = facet + ":-" + value;
  this.excludes = this.excludes || {};
  this.excludes[refinement] = true;
};

/**
 * Ensure a facet exclude does not exist
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 */
AlgoliaSearchHelper.prototype.removeExclude = function( facet, value ) {
  var refinement = facet + ":-" + value;
  this.excludes = this.excludes || {};
  this.excludes[refinement] = false;
};

/**
 * Toggle refinement state of an exclude
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {boolean} true if the facet has been found
 */
AlgoliaSearchHelper.prototype.toggleExclude = function( facet, value ) {
  for ( var i = 0; i < this.options.facets.length; ++i ) {
    if ( this.options.facets[i] === facet ) {
      var refinement = facet + ":-" + value;
      this.excludes[refinement] = !this.excludes[refinement];
      this.page = 0;
      this._search();
      return true;
    }
  }
  return false;
};

/**
 * Toggle refinement state of a facet
 * @param  {string} facet the facet to refine
 * @param  {string} value the associated value
 * @return {boolean} true if the facet has been found
 */
AlgoliaSearchHelper.prototype.toggleRefine = function( facet, value ) {
  for ( var i = 0; i < this.options.facets.length; ++i ) {
    if ( this.options.facets[i] === facet ) {
      var refinement = facet + ":" + value;
      this.refinements[refinement] = !this.refinements[refinement];
      this.page = 0;
      this._search();
      return true;
    }
  }
  this.disjunctiveRefinements[facet] = this.disjunctiveRefinements[facet] || {};
  for ( var j = 0; j < this.options.disjunctiveFacets.length; ++j ) {
    if ( this.options.disjunctiveFacets[j] === facet ) {
      this.disjunctiveRefinements[facet][value] = !this.disjunctiveRefinements[facet][value];
      this.page = 0;
      this._search();
      return true;
    }
  }
  return false;
};

/**
 * Check the refinement state of a facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isRefined = function( facet, value ) {
  var refinement = facet + ":" + value;
  return this.refinements[refinement] ||
    (this.disjunctiveRefinements[facet] && this.disjunctiveRefinements[facet][value]);
};

/**
 * Check the exclude state of a facet
 * @param  {string}  facet the facet
 * @param  {string}  value the associated value
 * @return {boolean} true if refined
 */
AlgoliaSearchHelper.prototype.isExcluded = function( facet, value ) {
  var refinement = facet + ":-" + value;
  return !!this.excludes[refinement];
};

/**
 * Go to next page
 */
AlgoliaSearchHelper.prototype.nextPage = function() {
  this._gotoPage( this.page + 1 );
};

/**
 * Go to previous page
 */
AlgoliaSearchHelper.prototype.previousPage = function() {
  if ( this.page > 0 ) {
    this._gotoPage( this.page - 1 );
  }
};

/**
 * Goto a page
 * @param  {integer} page The page number
 */
AlgoliaSearchHelper.prototype.gotoPage = function( page ) {
  this._gotoPage( page );
};

/**
 * Configure the page but do not trigger a reload
 * @param  {integer} page The page number
 */
AlgoliaSearchHelper.prototype.setPage = function( page ) {
  this.page = page;
};

/**
 * Configure the underlying index name
 * @param {string} name the index name
 */
AlgoliaSearchHelper.prototype.setIndex = function( name ) {
  this.index = name;
};

/**
 * Get the underlying configured index name
 */
AlgoliaSearchHelper.prototype.getIndex = function() {
  return this.index;
};

/**
 * Clear the extra queries added to the underlying batch of queries
 */
AlgoliaSearchHelper.prototype.clearExtraQueries = function() {
  this.extraQueries = [];
};

/**
 * Add an extra query to the underlying batch of queries. Once you add queries
 * to the batch, the 2nd parameter of the searchCallback will be an object with a `results`
 * attribute listing all search results.
 */
AlgoliaSearchHelper.prototype.addExtraQuery = function( index, query, params ) {
  this.extraQueries.push( { index : index, query : query, params : ( params || {} ) } );
};

///////////// PRIVATE

/**
 * Goto a page
 * @param  {integer} page The page number
 */
AlgoliaSearchHelper.prototype._gotoPage = function( page ) {
  this.page = page;
  this._search();
};

/**
 * Perform the underlying queries
 */
AlgoliaSearchHelper.prototype._search = function() {
  this.client.startQueriesBatch();
  this.client.addQueryInBatch( this.index, this.q, this._getHitsSearchParams() );
  var disjunctiveFacets = [];
  var unusedDisjunctiveFacets = {};
  var i = 0;
  for ( i = 0; i < this.options.disjunctiveFacets.length; ++i ) {
    var disjunctiveFacet = this.options.disjunctiveFacets[i];
    if ( this._hasDisjunctiveRefinements( disjunctiveFacet ) ) {
      disjunctiveFacets.push( disjunctiveFacet );
    }
    else {
      unusedDisjunctiveFacets[ disjunctiveFacet ] = true;
    }
  }
  for ( i = 0; i < disjunctiveFacets.length; ++i ) {
    this.client.addQueryInBatch( this.index, this.q, this._getDisjunctiveFacetSearchParams( disjunctiveFacets[i] ) );
  }
  for ( i = 0; i < this.extraQueries.length; ++i ) {
    this.client.addQueryInBatch( this.extraQueries[i].index, this.extraQueries[i].query, this.extraQueries[i].params );
  }
  var self = this;
  this.client.sendQueriesBatch( function( err, content ) {
    if ( err ) {
      self.emit( "error", err )
      return;
    }
    var aggregatedAnswer = content.results[0];
    aggregatedAnswer.disjunctiveFacets = aggregatedAnswer.disjunctiveFacets || {};
    aggregatedAnswer.facetStats = aggregatedAnswer.facetStats || {};
    // create disjunctive facets from facets (disjunctive facets without refinements)
    for ( var unusedFacet in unusedDisjunctiveFacets ) {
      if ( aggregatedAnswer.facets[ unusedFacet ] && !aggregatedAnswer.disjunctiveFacets[ unusedFacet ] ) {
        aggregatedAnswer.disjunctiveFacets[ unusedFacet ] = aggregatedAnswer.facets[ unusedFacet ];
        try {
          delete aggregatedAnswer.facets[ unusedFacet ];
        }
        catch ( error ) {
          aggregatedAnswer.facets[ unusedFacet ] = undefined; // IE compat
        }
      }
    }
    // aggregate the disjunctive facets
    for ( i = 0; i < disjunctiveFacets.length; ++i ) {
      for ( var dfacet in content.results[i + 1].facets ) {
        aggregatedAnswer.disjunctiveFacets[dfacet] = content.results[i + 1].facets[dfacet];
        if ( self.disjunctiveRefinements[dfacet] ) {
          for ( var refinementValue in self.disjunctiveRefinements[dfacet] ) {
            // add the disjunctive reginements if it is no more retrieved
            if ( !aggregatedAnswer.disjunctiveFacets[dfacet][refinementValue] &&
                self.disjunctiveRefinements[dfacet][refinementValue] ) {
              aggregatedAnswer.disjunctiveFacets[dfacet][refinementValue] = 0;
            }
          }
        }
      }
      // aggregate the disjunctive facets stats
      for ( var stats in content.results[i + 1].facets_stats ) {
        aggregatedAnswer.facetStats[stats] = content.results[i + 1].facets_stats[stats];
      }
    }
    // add the excludes
    for ( var exclude in self.excludes ) {
      if ( self.excludes[exclude] ) {
        var e = exclude.indexOf( ":-" );
        var facet = exclude.slice( 0, e );
        var value = exclude.slice( e + 2 );
        aggregatedAnswer.facets[facet] = aggregatedAnswer.facets[facet] || {};
        if ( !aggregatedAnswer.facets[facet][value] ) {
          aggregatedAnswer.facets[facet][value] = 0;
        }
      }
    }
    // call the actual callback
    if ( self.extraQueries.length === 0 ) {
      self.emit( "result", aggregatedAnswer );
    }
    else {
      // append the extra queries
      var c = { results : [ aggregatedAnswer ] };
      for ( i = 0; i < self.extraQueries.length; ++i ) {
        c.results.push( content.results[1 + disjunctiveFacets.length + i] );
      }
      self.emit( "result", c );
    }
  } );
};

/**
 * Build search parameters used to fetch hits
 * @return {hash}
 */
AlgoliaSearchHelper.prototype._getHitsSearchParams = function() {
  var facets = [];
  var i = 0;
  for ( i = 0; i < this.options.facets.length; ++i ) {
    facets.push( this.options.facets[i] );
  }
  for ( i = 0; i < this.options.disjunctiveFacets.length; ++i ) {
    var facet = this.options.disjunctiveFacets[i];
    if ( !this._hasDisjunctiveRefinements( facet ) ) {
      facets.push( facet );
    }
  }
  return extend( {}, {
    hitsPerPage : this.options.hitsPerPage,
    page : this.page,
    facets : facets,
    facetFilters : this._getFacetFilters()
  }, this.searchParams );
};

/**
 * Build search parameters used to fetch a disjunctive facet
 * @param  {string} facet the associated facet name
 * @return {hash}
 */
AlgoliaSearchHelper.prototype._getDisjunctiveFacetSearchParams = function( facet ) {
  return extend( {}, this.searchParams, {
    hitsPerPage : 1,
    page : 0,
    attributesToRetrieve : [],
    attributesToHighlight : [],
    attributesToSnippet : [],
    facets : facet,
    facetFilters : this._getFacetFilters( facet )
  } );
};

/**
 * Test if there are some disjunctive refinements on the facet
 */
AlgoliaSearchHelper.prototype._hasDisjunctiveRefinements = function( facet ) {
  for ( var value in this.disjunctiveRefinements[facet] ) {
    if ( this.disjunctiveRefinements[facet][value] ) {
      return true;
    }
  }
  return false;
};

/**
 * Build facetFilters parameter based on current refinements
 * @param  {string} facet if set, the current disjunctive facet
 * @return {hash}
 */
AlgoliaSearchHelper.prototype._getFacetFilters = function( facet ) {
  var facetFilters = [];
  if ( this.options.defaultFacetFilters ) {
    for ( var i = 0; i < this.options.defaultFacetFilters.length; ++i ) {
      facetFilters.push( this.options.defaultFacetFilters[i] );
    }
  }
  for ( var refinement in this.refinements ) {
    if ( this.refinements[refinement] ) {
      facetFilters.push( refinement );
    }
  }
  for ( var exclude in this.excludes ) {
    if ( this.excludes[exclude] ) {
      facetFilters.push( exclude );
    }
  }
  for ( var disjunctiveRefinement in this.disjunctiveRefinements ) {
    if ( disjunctiveRefinement !== facet ) {
      var refinements = [];
      for ( var value in this.disjunctiveRefinements[disjunctiveRefinement] ) {
        if ( this.disjunctiveRefinements[disjunctiveRefinement][value] ) {
          refinements.push( disjunctiveRefinement + ":" + value );
        }
      }
      if ( refinements.length > 0 ) {
        facetFilters.push( refinements );
      }
    }
  }
  return facetFilters;
};

module.exports = AlgoliaSearchHelper;

},{"./functions/extend":8,"events":2,"util":6}],8:[function(require,module,exports){
"use strict";
module.exports = function extend( out ) {
  out = out || {};
  for ( var i = 1; i < arguments.length; i++ ) {
    if ( !arguments[i] ) {
      continue;
    }
    for ( var key in arguments[i] ) {
      if ( arguments[i].hasOwnProperty( key ) ) {
        out[key] = arguments[i][key];
      }
    }
  }
  return out;
};

},{}]},{},[1])(1)
});