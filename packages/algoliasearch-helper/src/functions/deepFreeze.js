"use strict";
var isObject = require( "lodash/lang/isObject" );
var forEach = require( "lodash/collection/forEach" );

/**
 * Recursively freeze the parts of an object that are not frozen.
 * @private
 * @param {object} obj object to freeze
 * @return {object} the object frozen
 */
var deepFreeze = function( obj ) {
  if( !isObject( obj ) ) return obj;

  forEach( obj, deepFreeze );
  if( !Object.isFrozen( obj ) ) {
    Object.freeze( obj );
  }

  return obj;
};

module.exports = deepFreeze;
