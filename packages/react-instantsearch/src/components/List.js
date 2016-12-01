import React, {PropTypes, Component} from 'react';

const itemsPropType = PropTypes.arrayOf(PropTypes.shape({
  value: PropTypes.any,
  label: PropTypes.string.isRequired,
  children: (...args) => itemsPropType(...args),
}));

class List extends Component {
  static propTypes = {
    cx: PropTypes.func.isRequired,
    // Only required with showMore.
    translate: PropTypes.func,
    items: itemsPropType,
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

  renderItem = item => {
    const children = item.children &&
      <div {...this.props.cx('itemChildren')}>
        {item.children.slice(0, this.getLimit()).map(child =>
          this.renderItem(child, item)
        )}
      </div>;

    return (
      <div
        key={item.key || item.label}
        {...this.props.cx(
          'item',
          item.isRefined && 'itemSelected',
          children && 'itemParent',
          children && item.isRefined && 'itemSelectedParent'
        )}
      >
        {this.props.renderItem(item)}
        {children}
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

  render() {
    const {cx, items} = this.props;
    if (items.length === 0) {
      return null;
    }

    // Always limit the number of items we show on screen, since the actual
    // number of retrieved items might vary with the `maxValuesPerFacet` config
    // option.
    const limit = this.getLimit();
    return (
      <div {...cx('root')}>
        <div {...cx('items')}>
          {items.slice(0, limit).map(item => this.renderItem(item))}
        </div>
        {this.renderShowMore()}
      </div>
    );
  }
}

export default List;
