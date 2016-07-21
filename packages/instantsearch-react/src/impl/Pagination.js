import React, {PropTypes, Component} from 'react';
import range from 'lodash/utility/range';
import themeable from 'react-themeable';

import {getTranslation, capitalize, isSpecialClick} from './utils';
import PaginationLink from './PaginationLink';

function getPagesDisplayedCount(padding, total) {
  return Math.min(2 * padding + 1, total);
}

function calculatePaddingLeft(current, padding, total, totalDisplayedPages) {
  if (current <= padding) {
    return current;
  }

  if (current >= total - padding) {
    return totalDisplayedPages - (total - current);
  }

  return padding;
}

function getPages(page, total, padding) {
  const totalDisplayedPages = getPagesDisplayedCount(padding, total);
  if (totalDisplayedPages === total) return range(0, total);

  const paddingLeft = calculatePaddingLeft(
    page,
    padding,
    total,
    totalDisplayedPages
  );
  const paddingRight = totalDisplayedPages - paddingLeft;

  const first = page - paddingLeft;
  const last = page + paddingRight;

  return range(first, last);
}

const defaultTranslations = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»',
  page: page => (page + 1).toString(),
  ariaPrevious: 'Previous page',
  ariaNext: 'Next page',
  ariaFirst: 'First page',
  ariaLast: 'Last page',
  ariaPage: page => `Page ${(page + 1).toString()}`,
};

const defaultTheme = {
  root: 'Pagination',
  item: 'Pagination__item',
  first: 'Pagination__item--first',
  last: 'Pagination__item--last',
  previous: 'Pagination__item--previous',
  next: 'Pagination__item--next',
  page: 'Pagination__item--page',
  active: 'Pagination__item--active',
  disabled: 'Pagination__item--disabled',
  link: 'Pagination__item__link',
};

class Pagination extends Component {
  static propTypes = {
    // Provided by `createPagination`
    nbPages: PropTypes.number,
    page: PropTypes.number,
    refine: PropTypes.func.isRequired,

    translations: PropTypes.object,
    theme: PropTypes.object,
    createURL: PropTypes.func,
    showFirst: PropTypes.bool,
    showPrevious: PropTypes.bool,
    showNext: PropTypes.bool,
    showLast: PropTypes.bool,
    pagesPadding: PropTypes.number,
    maxPages: PropTypes.number,
  };

  static defaultProps = {
    theme: defaultTheme,
    translations: defaultTranslations,
    showFirst: true,
    showPrevious: true,
    showNext: true,
    showLast: false,
    pagesPadding: 3,
    maxPages: Infinity,
  };

  renderPageLink({
    translationKey,
    pageNumber,
    isActive = false,
  }) {
    const {
      createURL,
      theme,
      nbPages,
      maxPages,
      page,
      translations,
    } = this.props;
    const isDisabled =
      !isActive && page === pageNumber ||
      pageNumber < 0 ||
      pageNumber >= Math.min(maxPages, nbPages);
    // @TODO: Default createURL that works with URL sync
    const url = createURL && !isDisabled ? createURL(pageNumber) : '#';
    const key = translationKey + pageNumber;
    const ariaTranslationKey = `aria${capitalize(translationKey)}`;

    return (
      <PaginationLink
        key={key}
        label={getTranslation(
          translationKey,
          defaultTranslations,
          translations,
          pageNumber
        )}
        ariaLabel={getTranslation(
          ariaTranslationKey,
          defaultTranslations,
          translations,
          pageNumber
        )}
        onClick={this.onClick}
        isDisabled={isDisabled}
        isActive={isActive}
        pageNumber={pageNumber}
        url={url}
        modifier={translationKey}
        theme={theme}
      />
    );
  }

  renderPreviousPageLink() {
    return this.renderPageLink({
      translationKey: 'previous',
      pageNumber: this.props.page - 1,
    });
  }

  renderNextPageLink() {
    return this.renderPageLink({
      translationKey: 'next',
      pageNumber: this.props.page + 1,
    });
  }

  renderFirstPageLink() {
    return this.renderPageLink({
      translationKey: 'first',
      pageNumber: 0,
    });
  }

  renderLastPageLink() {
    const {nbPages, maxPages} = this.props;
    return this.renderPageLink({
      translationKey: 'last',
      pageNumber: Math.min(nbPages, maxPages) - 1,
    });
  }

  renderPageLinks() {
    const {page, nbPages, maxPages, pagesPadding} = this.props;
    const total = Math.min(nbPages, maxPages);
    return getPages(page, total, pagesPadding).map(pageNumber =>
      this.renderPageLink({
        translationKey: 'page',
        isActive: pageNumber === this.props.page,
        pageNumber,
      })
    );
  }

  onClick = (pageNumber, event) => {
    if (isSpecialClick(event)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    event.preventDefault();
    this.props.refine(pageNumber);
    return false;
  }

  render() {
    const {
      nbPages,
      showFirst,
      showPrevious,
      showNext,
      showLast,
      theme,
    } = this.props;
    const th = themeable(theme);

    if (!nbPages) {
      return null;
    }

    return (
      <ul {...th('root', 'root')}>
        {showFirst && this.renderFirstPageLink()}
        {showPrevious && this.renderPreviousPageLink()}
        {this.renderPageLinks()}
        {showNext && this.renderNextPageLink()}
        {showLast && this.renderLastPageLink()}
      </ul>
    );
  }
}

export default Pagination;
