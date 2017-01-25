import React, {PropTypes, Component} from 'react';
import {range} from 'lodash';
import {capitalize} from '../core/utils';
import translatable from '../core/translatable';
import LinkList from './LinkList';
import classNames from './classNames.js';

const cx = classNames('Pagination');

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
  if (totalDisplayedPages === total) return range(1, total + 1);

  const paddingLeft = calculatePaddingLeft(
    page,
    padding,
    total,
    totalDisplayedPages
  );
  const paddingRight = totalDisplayedPages - paddingLeft;

  const first = page - paddingLeft;
  const last = page + paddingRight;
  return range(first + 1, last + 1);
}

class Pagination extends Component {
  static propTypes = {
    nbPages: PropTypes.number.isRequired,
    currentRefinement: PropTypes.number.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,

    translate: PropTypes.func.isRequired,
    listComponent: PropTypes.func,

    showFirst: PropTypes.bool,

    showPrevious: PropTypes.bool,

    showNext: PropTypes.bool,

    showLast: PropTypes.bool,

    pagesPadding: PropTypes.number,

    maxPages: PropTypes.number,
  };

  static defaultProps = {
    listComponent: LinkList,
    showFirst: true,
    showPrevious: true,
    showNext: true,
    showLast: false,
    pagesPadding: 3,
    maxPages: Infinity,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(props) {
    if (this.context.canRefine) this.context.canRefine(props.canRefine);
  }

  getItem(modifier, translationKey, value) {
    const {
      nbPages,
      maxPages,
      translate,
    } = this.props;
    return {
      key: `${modifier}.${value}`,
      modifier,
      disabled: value < 1 ||
      value >= Math.min(maxPages, nbPages),
      label: translate(translationKey, value),
      value,
      ariaLabel: translate(`aria${capitalize(translationKey)}`, value),
    };
  }

  render() {
    const {
      nbPages,
      maxPages,
      currentRefinement,
      pagesPadding,
      showFirst,
      showPrevious,
      showNext,
      showLast,
      refine,
      createURL,
      translate,
      listComponent: ListComponent,
      ...otherProps
    } = this.props;

    const totalPages = Math.min(nbPages, maxPages);
    const lastPage = totalPages;

    let items = [];
    if (showFirst) {
      items.push({
        key: 'first',
        modifier: 'itemFirst',
        disabled: currentRefinement === 1,
        label: translate('first'),
        value: 1,
        ariaLabel: translate('ariaFirst'),
      });
    }
    if (showPrevious) {
      items.push({
        key: 'previous',
        modifier: 'itemPrevious',
        disabled: currentRefinement === 1,
        label: translate('previous'),
        value: currentRefinement - 1,
        ariaLabel: translate('ariaPrevious'),
      });
    }

    const samePage = {
      valueOf: () => currentRefinement,
      isSamePage: true,
    };

    items = items.concat(
      getPages(currentRefinement, totalPages, pagesPadding).map(value => ({
        key: value,
        modifier: 'itemPage',
        label: translate('page', value),
        value: value === currentRefinement ? samePage : value,
        ariaLabel: translate('ariaPage', value),
      }))
    );
    if (showNext) {
      items.push({
        key: 'next',
        modifier: 'itemNext',
        disabled: currentRefinement === lastPage,
        label: translate('next'),
        value: currentRefinement + 1,
        ariaLabel: translate('ariaNext'),
      });
    }
    if (showLast) {
      items.push({
        key: 'last',
        modifier: 'itemLast',
        disabled: currentRefinement === lastPage,
        label: translate('last'),
        value: lastPage,
        ariaLabel: translate('ariaLast'),
      });
    }

    return (
      <ListComponent
        {...otherProps}
        cx={cx}
        items={items}
        selectedItem={currentRefinement}
        onSelect={refine}
        createURL={createURL}
      />
    );
  }
}

export default translatable({
  previous: '‹',
  next: '›',
  first: '«',
  last: '»',
  page: currentRefinement => currentRefinement.toString(),
  ariaPrevious: 'Previous page',
  ariaNext: 'Next page',
  ariaFirst: 'First page',
  ariaLast: 'Last page',
  ariaPage: currentRefinement => `Page ${currentRefinement.toString()}`,
})(Pagination);
