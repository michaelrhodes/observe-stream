(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var stream = require('stream-mixin')
var observe = require('observe-stream')

var model = {
  name: ''
}

// Mixin pre-configured duplex stream.
observe.call(model)

var input = document.createElement('input')

// Make duplex stream from scratch.
stream.call(input)
input.readable = true
input.writable = true
input.write = function(data) {
  this.value = data.name
}
input.end = function() {
}

input.value = model.name
input.addEventListener('input', function() {
  this.emit('data', { name: this.value })
})

// Make them talk
model.pipe(input).pipe(model)

// Let us interact
window.model = model
window.input = input
document.body.insertBefore(input, document.querySelector('h2'))

},{"observe-stream":2,"stream-mixin":3}],2:[function(require,module,exports){
var stream = require('stream-mixin')

var defineProperty = function(context, property, value) {
  var _value = value
  
  // Prepare to redefine existing properties.
  if (context.hasOwnProperty(property)) {
    _value = context[property]
    delete context[property]
  }

  // Emit data events when the property changes.
  Object.defineProperty(context, property, {
    get: function() {
      return _value
    },
    set: function(value) {
      _value = value
      var data = {}
      data[property] = _value
      context.emit('data', data)
    }
  })
}

module.exports = function() {

  // Redefine existing properties so
  // that changes produce data events.
  for (var property in this) {
    defineProperty(this, property) 
  }

  // Update existing properties.
  this.write = function(data) {
    for (var property in data) {
      if (this.hasOwnProperty(property)) {
        this[property] = data[property]
      }
    }
  }

  this.end = function() {

  }
  
  // Allow additional properties to be added
  // after the mixin has been called.
  this.define = function(name, value) {
    defineProperty(this, name, value)
  }

  // Mixin duplex stream
  stream.call(this)
  this.readable = true
  this.writable = true

}

},{"stream-mixin":3}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
// Crollian-mixin-ified by Michael Rhodes
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

var events = require('emitter-component')

module.exports = (function() {
  var pipe = function(dest, options) {
    var source = this

    function ondata(chunk) {
      if (dest.writable) {
        if (false === dest.write(chunk) && source.pause) {
          source.pause()
        }
      }
    }

    source.on('data', ondata)

    function ondrain() {
      if (source.readable && source.resume) {
        source.resume()
      }
    }

    dest.on('drain', ondrain)

    // If the 'end' option is not supplied, dest.end() will be called when
    // source gets the 'end' or 'close' events.  Only dest.end() once.
    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on('end', onend)
      source.on('close', onclose)
    }

    var didOnEnd = false
    function onend() {
      if (didOnEnd) return
      didOnEnd = true

      dest.end()
    }

    function onclose() {
      if (didOnEnd) return
      didOnEnd = true

      if (typeof dest.destroy === 'function') dest.destroy()
    }

    // don't leave dangling pipes when there are errors.
    function onerror(er) {
      cleanup()
      if (this.listeners('error').length === 0) {
        throw er // Unhandled stream error in pipe.
      }
    }

    source.on('error', onerror)
    dest.on('error', onerror)

    // remove all the event listeners that were added.
    function cleanup() {
      source.removeListener('data', ondata)
      dest.removeListener('drain', ondrain)

      source.removeListener('end', onend)
      source.removeListener('close', onclose)

      source.removeListener('error', onerror)
      dest.removeListener('error', onerror)

      source.removeListener('end', cleanup)
      source.removeListener('close', cleanup)

      dest.removeListener('close', cleanup)
    }

    source.on('end', cleanup)
    source.on('close', cleanup)
    dest.on('close', cleanup)
    dest.emit('pipe', source)

    // Allow for unix-like usage: A.pipe(B).pipe(C)
    return dest
  }

  return function() {
    events(this)
    this.pipe = pipe
  }
})()

},{"emitter-component":4}],4:[function(require,module,exports){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{"indexof":5}],5:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}]},{},[1])
