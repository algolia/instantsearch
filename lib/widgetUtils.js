'use strict';

var isString = require('lodash/lang/isString');

function getContainerNode(value){
  if(isString(value)){
    return document.querySelector(value);
  }
  return value;
}

module.exports = {
  getContainerNode : getContainerNode
};
