import React, {PropTypes, Component} from 'react';
import {pick} from 'lodash';
import translatable from '../core/translatable';
import List from './List';
import classNames from './classNames.js';
import Highlight from '../widgets/Highlight';
import SearchBox from '../components/SearchBox';
const cx = classNames('RefinementList');

class RefinementList extends Component {
  constructor(props) {
    super(props);
    this.state = {query: ''};
  }

  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    searchForFacetValues: PropTypes.func,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.arrayOf(PropTypes.string).isRequired,
      count: PropTypes.number.isRequired,
      isRefined: PropTypes.bool.isRequired,
    })),
    isFromSearch: PropTypes.bool.isRequired,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  selectItem = item => {
    this.props.refine(item.value);
  };

  renderItem = item => {
    const label = item._highlightResult
      ? <Highlight attributeName="label" hit={item}/>
      : item.label;

    return (
      <label>
        <input
          {...cx('itemCheckbox', item.isRefined && 'itemCheckboxSelected')}
          type="checkbox"
          checked={item.isRefined}
          onChange={() => this.selectItem(item)}
        />
        <span {...cx('itemBox', 'itemBox', item.isRefined && 'itemBoxSelected')}></span>
        <span {...cx('itemLabel', 'itemLabel', item.isRefined && 'itemLabelSelected')}>
          {label}
        </span>
        {' '}
        <span {...cx('itemCount', item.isRefined && 'itemCountSelected')}>
          {item.count}
        </span>
      </label>);
  };

  render() {
    const facets = this.props.items.length > 0
      ? <List
        renderItem={this.renderItem}
        cx={cx}
        {...pick(this.props, [
          'translate',
          'items',
          'showMore',
          'limitMin',
          'limitMax',
        ])}
      />
      : <div>{this.props.translate('noResults')}</div>;

    const searchBox = this.props.searchForFacetValues ?
      <div {...cx('SearchBox')}>
        <SearchBox
          currentRefinement={this.props.isFromSearch ? this.state.query : ''}
          refine={value => {
            this.setState({query: value});
            this.props.searchForFacetValues(value);
          }}
          translate={this.props.translate}
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            if (this.props.isFromSearch) {
              this.selectItem(this.props.items[0]);
            }
          }}
        />
      </div> : null;

    return (
      <div>
        {searchBox}
        {facets}
      </div>
    );
  }
}

export default translatable({
  showMore: extended => extended ? 'Show less' : 'Show more',
  noResults: 'No Results',
})(RefinementList);

