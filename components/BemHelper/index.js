"use strict";

var BemHelper = function BemHelper( block ) {
  return function( element, modifier ) {
    if ( !element ) {
      return block;
    }
    if ( !modifier ) {
      return block + "--" + element;
    }
    return block + "--" + element + "__" + modifier;
  };
};

module.exports = BemHelper;
