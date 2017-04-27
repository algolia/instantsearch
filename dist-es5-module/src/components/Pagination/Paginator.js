'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Paginator = function () {
  function Paginator(params) {
    _classCallCheck(this, Paginator);

    this.currentPage = params.currentPage;
    this.total = params.total;
    this.padding = params.padding;
  }

  _createClass(Paginator, [{
    key: 'pages',
    value: function pages() {
      var total = this.total;
      var currentPage = this.currentPage;
      var padding = this.padding;


      var totalDisplayedPages = this.nbPagesDisplayed(padding, total);
      if (totalDisplayedPages === total) return (0, _range2.default)(0, total);

      var paddingLeft = this.calculatePaddingLeft(currentPage, padding, total, totalDisplayedPages);
      var paddingRight = totalDisplayedPages - paddingLeft;

      var first = currentPage - paddingLeft;
      var last = currentPage + paddingRight;

      return (0, _range2.default)(first, last);
    }
  }, {
    key: 'nbPagesDisplayed',
    value: function nbPagesDisplayed(padding, total) {
      return Math.min(2 * padding + 1, total);
    }
  }, {
    key: 'calculatePaddingLeft',
    value: function calculatePaddingLeft(current, padding, total, totalDisplayedPages) {
      if (current <= padding) {
        return current;
      }

      if (current >= total - padding) {
        return totalDisplayedPages - (total - current);
      }

      return padding;
    }
  }, {
    key: 'isLastPage',
    value: function isLastPage() {
      return this.currentPage === this.total - 1;
    }
  }, {
    key: 'isFirstPage',
    value: function isFirstPage() {
      return this.currentPage === 0;
    }
  }]);

  return Paginator;
}();

exports.default = Paginator;