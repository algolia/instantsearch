'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getShowMoreConfig;

var _defaultShowMoreTemplates = require('./defaultShowMoreTemplates.js');

var _defaultShowMoreTemplates2 = _interopRequireDefault(_defaultShowMoreTemplates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultShowMoreConfig = {
  templates: _defaultShowMoreTemplates2.default,
  limit: 100
};

function getShowMoreConfig(showMoreOptions) {
  if (!showMoreOptions) return null;

  if (showMoreOptions === true) {
    return defaultShowMoreConfig;
  }

  var config = _extends({}, showMoreOptions);
  if (!showMoreOptions.templates) {
    config.templates = defaultShowMoreConfig.templates;
  }
  if (!showMoreOptions.limit) {
    config.limit = defaultShowMoreConfig.limit;
  }
  return config;
}