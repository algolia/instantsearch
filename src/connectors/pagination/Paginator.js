import { range } from '../../lib/utils';

class Paginator {
  constructor(params) {
    this.currentPage = params.currentPage;
    this.total = params.total;
    this.padding = params.padding;
  }

  pages() {
    const { total, currentPage, padding } = this;

    if (total === 0) return [0];

    const totalDisplayedPages = this.nbPagesDisplayed(padding, total);
    if (totalDisplayedPages === total) {
      return range({ end: total });
    }

    const paddingLeft = this.calculatePaddingLeft(
      currentPage,
      padding,
      total,
      totalDisplayedPages
    );
    const paddingRight = totalDisplayedPages - paddingLeft;

    const first = currentPage - paddingLeft;
    const last = currentPage + paddingRight;

    return range({ start: first, end: last });
  }

  nbPagesDisplayed(padding, total) {
    return Math.min(2 * padding + 1, total);
  }

  calculatePaddingLeft(current, padding, total, totalDisplayedPages) {
    if (current <= padding) {
      return current;
    }

    if (current >= total - padding) {
      return totalDisplayedPages - (total - current);
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

export default Paginator;
