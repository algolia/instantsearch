import React, {PropTypes, Component} from 'react';
import range from 'lodash/utility/range';

import {capitalize, isSpecialClick} from '../utils';
import themeable from '../themeable';
import translatable from '../translatable';

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

class Pagination extends Component {
  static propTypes = {
    // Provided by `createPagination`
    nbPages: PropTypes.number,
    page: PropTypes.number,
    refine: PropTypes.func.isRequired,

    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    createURL: PropTypes.func,
    showFirst: PropTypes.bool,
    showPrevious: PropTypes.bool,
    showNext: PropTypes.bool,
    showLast: PropTypes.bool,
    pagesPadding: PropTypes.number,
    maxPages: PropTypes.number,
  };

  static defaultProps = {
    showFirst: true,
    showPrevious: true,
    showNext: true,
    showLast: false,
    pagesPadding: 3,
    maxPages: Infinity,
  };

  onClick = (pageNumber, event) => {
    if (isSpecialClick(event)) {
      // do not alter the default browser behavior
      // if one special key is down
      return undefined;
    }
    event.preventDefault();
    this.props.refine(pageNumber);
    return false;
  }

  renderPageLink({
    translationKey,
    pageNumber,
    isActive = false,
  }) {
    const {
      createURL,
      applyTheme,
      nbPages,
      maxPages,
      page,
      translate,
    } = this.props;
    const isDisabled =
      !isActive && page === pageNumber ||
      pageNumber < 0 ||
      pageNumber >= Math.min(maxPages, nbPages);
    // @TODO: Default createURL that works with URL sync
    const key = translationKey + pageNumber;
    const ariaTranslationKey = `aria${capitalize(translationKey)}`;

    // "Enable" the element, by making it a link
    const tag = isDisabled ? 'span' : 'a';
    const props = {
      'aria-label': translate(ariaTranslationKey, pageNumber),
      ...applyTheme('link', 'link'),
      ...(isDisabled ? {} : {
        href: createURL ? createURL(pageNumber) : '#',
        onClick: this.onClick.bind(null, pageNumber),
      }),
    };
    const label = translate(translationKey, pageNumber);
    const element = React.createElement(tag, props, label);

    return (
      <li
        {...applyTheme(
          key,
          'item',
          isActive && 'active',
          isDisabled && 'disabled',
          translationKey
        )}
      >
        {element}
      </li>
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

  render() {
    const {
      nbPages,
      showFirst,
      showPrevious,
      showNext,
      showLast,
      applyTheme,
    } = this.props;

    if (!nbPages) {
      return null;
    }

    return (
      <ul {...applyTheme('root', 'root')}>
        {showFirst && this.renderFirstPageLink()}
        {showPrevious && this.renderPreviousPageLink()}
        {this.renderPageLinks()}
        {showNext && this.renderNextPageLink()}
        {showLast && this.renderLastPageLink()}
      </ul>
    );
  }
}

export default themeable({
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
})(
  translatable({
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
  })(Pagination)
);
