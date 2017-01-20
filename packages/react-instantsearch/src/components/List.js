import React, {PropTypes, Component} from 'react';
import SearchBox from '../components/SearchBox';

const itemsPropType = PropTypes.arrayOf(PropTypes.shape({
  value: PropTypes.any,
  label: PropTypes.string.isRequired,
  items: (...args) => itemsPropType(...args),
}));

class List extends Component {
  static propTypes = {
    cx: PropTypes.func.isRequired,
    // Only required with showMore.
    translate: PropTypes.func,
    items: itemsPropType,
    renderItem: PropTypes.func.isRequired,
    selectItem: PropTypes.func,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    limit: PropTypes.number,
    show: PropTypes.func,
    searchForFacetValues: PropTypes.func,
    isFromSearch: PropTypes.bool,
    canRefine: PropTypes.bool,
  };

  defaultProps= {
    isFromSearch: false,
  };

  constructor() {
    super();

    this.state = {
      extended: false,
    };
  }

  onShowMoreClick = () => {
    this.setState(state => ({
      extended: !state.extended,
    }));
  };

  getLimit = () => {
    const {limitMin, limitMax} = this.props;
    const {extended} = this.state;
    return extended ? limitMax : limitMin;
  };

  renderItem = item => {
    const items = item.items &&
      <div {...this.props.cx('itemItems')}>
        {item.items.slice(0, this.getLimit()).map(child =>
          this.renderItem(child, item)
        )}
      </div>;

    return (
      <div
        key={item.key || item.label}
        {...this.props.cx(
          'item',
          item.isRefined && 'itemSelected',
          items && 'itemParent',
          items && item.isRefined && 'itemSelectedParent'
        )}
      >
        {this.props.renderItem(item)}
        {items}
      </div>
    );
  };

  renderShowMore() {
    const {showMore, translate, cx} = this.props;
    const {extended} = this.state;
    const disabled = this.props.limitMin >= this.props.items.length;
    if (!showMore) {
      return null;
    }

    return (
      <button disabled={disabled}
              {...cx('showMore', disabled && 'showMoreDisabled')}
              onClick={this.onShowMoreClick}
      >
        {translate('showMore', extended)}
      </button>
    );
  }

  renderSearchBox() {
    const {cx, searchForFacetValues, isFromSearch, translate, items, selectItem} = this.props;
    const noResults = items.length === 0 ? <div {...cx('noResults')}>{translate('noResults')}</div> : null;
    return <div {...cx('SearchBox')}>
        <SearchBox
          currentRefinement={isFromSearch ? this.state.query : ''}
          refine={value => {
            this.setState({query: value});
            searchForFacetValues(value);
          }}
          translate={translate}
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            if (isFromSearch) {
              selectItem(items[0]);
            }
          }}
        />
        {noResults}
      </div>;
  }

  render() {
    const {cx, items, searchForFacetValues, canRefine} = this.props;
    const searchBox = searchForFacetValues && canRefine ? this.renderSearchBox() : null;
    if (items.length === 0) {
      return <div {...cx('root', !canRefine && 'noRefinement')}>
        {searchBox}
      </div>;
    }

    // Always limit the number of items we show on screen, since the actual
    // number of retrieved items might vary with the `maxValuesPerFacet` config
    // option.
    const limit = this.getLimit();
    return (
      <div {...cx('root', !this.props.canRefine && 'noRefinement')}>
        {searchBox}
        <div {...cx('items')}>
          {items.slice(0, limit).map(item => this.renderItem(item))}
        </div>
        {this.renderShowMore()}
      </div>
    );
  }
}

export default List;
