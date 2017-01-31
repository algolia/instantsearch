import React, {PropTypes, Component} from 'react';
import List from './List';
import classNames from './classNames.js';

const cx = classNames('MultiRange');

class MultiRange extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.string.isRequired,
      isRefined: PropTypes.bool.isRequired,
      noRefinement: PropTypes.bool.isRequired,
    })).isRequired,
    refine: PropTypes.func.isRequired,
    transformItems: PropTypes.func,
    canRefine: PropTypes.bool.isRequired,
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

  renderItem = item => {
    const {refine} = this.props;

    return (
      <label>
        <input
          {...cx('itemRadio', item.isRefined && 'itemRadioSelected')}
          type="radio"
          checked={item.isRefined}
          disabled={item.noRefinement}
          onChange={refine.bind(null, item.value)}
        />
        <span {...cx('itemBox', 'itemBox', item.isRefined && 'itemBoxSelected')}></span>
        <span {...cx('itemLabel', 'itemLabel', item.isRefined && 'itemLabelSelected')}>
          {item.label}
        </span>
      </label>
    );
  };

  render() {
    const {items, canRefine} = this.props;

    return (
      <List
        renderItem={this.renderItem}
        showMore={false}
        canRefine={canRefine}
        cx={cx}
        items={items.map(item => ({...item, key: item.value}))}
      />
    );
  }
}

export default MultiRange;
