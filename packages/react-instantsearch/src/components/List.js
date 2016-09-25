import React, {PropTypes, Component} from 'react';

const itemsPropType = PropTypes.arrayOf(PropTypes.shape({
  value: PropTypes.string.isRequired,
  children: (...args) => itemsPropType(...args),
}));

function hasSelectedChild(item, selectedItems) {
  return item.children && item.children.some(child =>
    selectedItems.indexOf(child.value) !== -1 ||
    hasSelectedChild(child, selectedItems)
  );
}

class List extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    // Only required with showMore.
    translate: PropTypes.func,
    items: itemsPropType,
    selectedItems: PropTypes.arrayOf(PropTypes.string).isRequired,
    renderItem: PropTypes.func.isRequired,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    limit: PropTypes.number,
    show: PropTypes.func,
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

  renderItem = (item, parent = null) => {
    const {selectedItems, applyTheme} = this.props;
    const selected = selectedItems.indexOf(item.value) !== -1;
    const limit = this.getLimit();

    const children = item.children &&
      <div {...applyTheme('itemChildren', 'itemChildren')}>
        {item.children.slice(0, limit).map(child =>
          this.renderItem(child, item)
        )}
      </div>;

    const selectedParent = hasSelectedChild(item, selectedItems);

    return (
      <div
        {...applyTheme(
          item.value,
          'item',
          selected && 'itemSelected',
          children && 'item_parent',
          selectedParent && 'itemSelectedParent'
        )}
      >
        {this.props.renderItem(item, selected, parent, selectedParent)}
        {children}
      </div>
    );
  };

  renderShowMore() {
    const {showMore, translate, applyTheme} = this.props;
    const {extended} = this.state;

    if (!showMore) {
      return null;
    }

    return (
      <button
        {...applyTheme('showMore', 'showMore')}
        onClick={this.onShowMoreClick}
      >
        {translate('showMore', extended)}
      </button>
    );
  }

  render() {
    const {applyTheme, items} = this.props;
    if (items.length === 0) {
      return null;
    }

    // Always limit the number of items we show on screen, since the actual
    // number of retrieved items might vary with the `maxValuesPerFacet` config
    // option.
    const limit = this.getLimit();
    return (
      <div {...applyTheme('root', 'root')}>
        <div {...applyTheme('items', 'items')}>
          {items.slice(0, limit).map(item => this.renderItem(item))}
        </div>
        {this.renderShowMore()}
      </div>
    );
  }
}

export default List;
