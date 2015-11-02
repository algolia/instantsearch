let range = require('lodash/utility/range');

class Paginator {
  constructor(params) {
    this.currentPage = params.currentPage;
    this.total = params.total;
    this.padding = params.padding;
  }

  pages() {
    let current = this.currentPage;
    let padding = this.padding;
    let paddingLeft = Math.min(this.calculatePaddingLeft(current, padding, this.total), this.total);
    let paddingRight = Math.max(Math.min(2 * padding + 1, this.total) - paddingLeft, 1);
    let first = Math.max(current - paddingLeft, 0);
    let last = current + paddingRight;
    return range(first, last);
  }

  calculatePaddingLeft(current, padding, total) {
    if (current <= padding) {
      return current;
    }

    if (current >= (total - padding)) {
      return 2 * padding + 1 - (total - current);
    }

    return padding;
  }

  isLastPage() {
    return this.currentPage === this.total - 1;
  }

  isFirstPage() {
    return this.currentPage === 0;
  }
}

module.exports = Paginator;
