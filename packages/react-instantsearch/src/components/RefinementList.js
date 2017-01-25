import React, {PropTypes, Component} from 'react';
import {pick} from 'lodash';
import translatable from '../core/translatable';
import List from './List';
import classNames from './classNames.js';
import Highlight from '../widgets/Highlight';
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
    canRefine: PropTypes.bool.isRequired,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    transformItems: PropTypes.func,
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

  selectItem = item => {
    this.props.refine(item.value);
  };

  renderItem = item => {
    const label = this.props.isFromSearch
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
    return (
      <div>
        <List
          renderItem={this.renderItem}
          selectItem={this.selectItem}
          cx={cx}
          {...pick(this.props, [
            'translate',
            'items',
            'showMore',
            'limitMin',
            'limitMax',
            'isFromSearch',
            'searchForFacetValues',
            'canRefine',
          ])}
        />
      </div>
    );
  }
}

export default translatable({
  showMore: extended => extended ? 'Show less' : 'Show more',
  noResults: 'No Results',
  submit: null,
  reset: null,
  resetTitle: 'Clear the search query.',
  submitTitle: 'Submit your search query.',
  placeholder: 'Search here…',
})(RefinementList);

