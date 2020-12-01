import { range } from '../../lib/utils';

class Paginator {
  public currentPage: number;
  public total: number;
  public padding: number;

  public constructor(params: {
    currentPage: number;
    total: number;
    padding: number;
  }) {
    this.currentPage = params.currentPage;
    this.total = params.total;
    this.padding = params.padding;
  }

  public pages() {
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

  public nbPagesDisplayed(padding: number, total: number) {
    return Math.min(2 * padding + 1, total);
  }

  public calculatePaddingLeft(
    current: number,
    padding: number,
    total: number,
    totalDisplayedPages: number
  ) {
    if (current <= padding) {
      return current;
    }

    if (current >= total - padding) {
      return totalDisplayedPages - (total - current);
    }

    return padding;
  }

  public isLastPage() {
    return this.currentPage === this.total - 1 || this.total === 0;
  }

  public isFirstPage() {
    return this.currentPage === 0;
  }
}

export default Paginator;
