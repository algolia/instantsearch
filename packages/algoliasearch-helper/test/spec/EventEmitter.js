'use strict';

var EventEmitter = require('../../src/EventEmitter');
var inherits = require('../../src/functions/inherits');

describe('EventEmitter', () => {
  test('calls the listeners in order with the arguments and the emitter as `this`', () => {
    var emitter = new EventEmitter();
    var calls = [];

    emitter.on('change', function (a, b) {
      calls.push(['first', this, a, b]);
    });
    emitter.addListener('change', function (a, b) {
      calls.push(['second', this, a, b]);
    });

    expect(emitter.emit('change', 1, 2)).toBe(true);
    expect(calls).toEqual([
      ['first', emitter, 1, 2],
      ['second', emitter, 1, 2],
    ]);
  });

  test('returns false when emitting an event without listeners', () => {
    expect(new EventEmitter().emit('change')).toBe(false);
  });

  test('works for subclasses that do not call the constructor', () => {
    function Child() {}
    inherits(Child, EventEmitter);
    var child = new Child();
    var listener = jest.fn();

    expect(child.listeners('change')).toEqual([]);
    expect(child.listenerCount('change')).toBe(0);
    child.removeListener('change', listener).removeAllListeners();
    child.on('change', listener).emit('change');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('supports event names that are Object.prototype properties', () => {
    var emitter = new EventEmitter();
    var listener = jest.fn();

    ['constructor', 'toString', '__proto__'].forEach(function (type) {
      expect(emitter.listeners(type)).toEqual([]);
      emitter.on(type, listener);
      emitter.emit(type);
    });
    emitter.removeAllListeners();
    emitter.on('constructor', listener);
    emitter.emit('constructor');

    expect(listener).toHaveBeenCalledTimes(4);
  });

  test('chains the methods that change listeners', () => {
    var emitter = new EventEmitter();
    var listener = function () {};

    expect(emitter.on('a', listener)).toBe(emitter);
    expect(emitter.addListener('a', listener)).toBe(emitter);
    expect(emitter.once('a', listener)).toBe(emitter);
    expect(emitter.removeListener('a', listener)).toBe(emitter);
    expect(emitter.removeAllListeners('a')).toBe(emitter);
    expect(emitter.removeAllListeners()).toBe(emitter);
  });

  describe('once', () => {
    test('calls the listener only the first time', () => {
      var emitter = new EventEmitter();
      var listener = jest.fn();

      emitter.once('change', listener);
      emitter.emit('change', 1);
      emitter.emit('change', 2);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(1);
      expect(emitter.listenerCount('change')).toBe(0);
    });

    test('calls the listener once when an earlier listener emits the same event', () => {
      var emitter = new EventEmitter();
      var listener = jest.fn();
      var emitted = false;

      emitter.on('change', function () {
        if (!emitted) {
          emitted = true;
          emitter.emit('change');
        }
      });
      emitter.once('change', listener);
      emitter.emit('change');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('can be removed with the original listener', () => {
      var emitter = new EventEmitter();
      var listener = jest.fn();

      emitter.once('change', listener);
      emitter.removeListener('change', listener);
      emitter.emit('change');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('removeListener', () => {
    test('removes the last registration of the listener', () => {
      var emitter = new EventEmitter();
      var calls = [];
      var listener = function (value) {
        calls.push(value);
      };
      var other = function () {
        calls.push('other');
      };

      emitter.on('change', listener);
      emitter.on('change', other);
      emitter.on('change', listener);
      emitter.removeListener('change', listener);
      emitter.emit('change', 'listener');

      expect(calls).toEqual(['listener', 'other']);
    });

    test('ignores a listener that is not registered or missing', () => {
      var emitter = new EventEmitter();
      var listener = jest.fn();

      emitter.on('change', listener);
      emitter.removeListener('change', function () {});
      emitter.removeListener('change', undefined);
      emitter.removeListener('other', listener);
      emitter.emit('change');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('does not skip listeners when a listener is removed during emit', () => {
      var emitter = new EventEmitter();
      var second = jest.fn();
      var first = function () {
        emitter.removeListener('change', first);
        emitter.removeListener('change', second);
      };

      emitter.on('change', first);
      emitter.on('change', second);
      emitter.emit('change');

      expect(second).toHaveBeenCalledTimes(1);
      expect(emitter.listenerCount('change')).toBe(0);
    });
  });

  describe('removeAllListeners', () => {
    test('removes the listeners of one event', () => {
      var emitter = new EventEmitter();
      var change = jest.fn();
      var result = jest.fn();

      emitter.on('change', change);
      emitter.on('result', result);
      emitter.removeAllListeners('change');
      emitter.emit('change');
      emitter.emit('result');

      expect(change).not.toHaveBeenCalled();
      expect(result).toHaveBeenCalledTimes(1);
    });

    test('removes the listeners of every event', () => {
      var emitter = new EventEmitter();
      var change = jest.fn();
      var result = jest.fn();

      emitter.on('change', change);
      emitter.on('result', result);
      emitter.removeAllListeners();
      emitter.emit('change');
      emitter.emit('result');

      expect(change).not.toHaveBeenCalled();
      expect(result).not.toHaveBeenCalled();
    });
  });

  test('listeners returns a copy', () => {
    var emitter = new EventEmitter();
    var listener = function () {};

    emitter.on('change', listener);
    emitter.listeners('change').pop();

    expect(emitter.listeners('change')).toEqual([listener]);
    expect(emitter.listenerCount('change')).toBe(1);
  });

  describe('error event', () => {
    test('throws the error when there is no listener', () => {
      var error = new Error('search failed');

      expect(() => new EventEmitter().emit('error', error)).toThrow(error);
    });

    test('throws an Error with the value as context when it is not an Error', () => {
      var value = { message: 'search failed' };
      var thrown;

      try {
        new EventEmitter().emit('error', value);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(Error);
      expect(thrown.context).toBe(value);
    });

    test('calls the listeners instead of throwing', () => {
      var emitter = new EventEmitter();
      var listener = jest.fn();
      var error = new Error('search failed');

      emitter.on('error', listener);

      expect(() => emitter.emit('error', error)).not.toThrow();
      expect(listener).toHaveBeenCalledWith(error);
    });
  });
});
