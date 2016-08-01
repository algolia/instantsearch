import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

const defaultTheme = {
  root: 'NumericRefinementList',
  list: 'NumericRefinementList__list',
  item: 'NumericRefinementList__item',
  itemSelected: 'NumericRefinementList__item--selected',
  itemLink: 'NumericRefinementList__item__link',
  itemValue: 'NumericRefinementList__item__value',
  itemCount: 'NumericRefinementList__item__count',
};

export default class NumericRefinementList extends Component {
  static propTypes = {
    theme: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.string.isRequired,
    })).isRequired,
    selectedItem: PropTypes.string.isRequired,
    refine: PropTypes.func.isRequired,
  };

  static defaultProps = {
    theme: defaultTheme,
  };

  renderItem = item => {
    const {selectedItem, theme} = this.props;
    const selected = item.value === selectedItem;

    const th = themeable(theme);

    return (
      <li
        {...th(
          item.value,
          'item',
          selected && 'itemSelected'
        )}
      >
        <label>
          <input
            {...th('itemRadio', 'itemRadio')}
            type="radio"
            checked={selected}
            onChange={this.props.refine.bind(null, item.value)}
          />
          <span {...th('itemLabel', 'itemLabel')}>
            {item.label}
          </span>
        </label>
      </li>
    );
  };

  render() {
    const {items, theme} = this.props;

    const th = themeable(theme);

    return (
      <div {...th('root', 'root')}>
        <ul {...th('list', 'list')}>
          {items.map(this.renderItem)}
        </ul>
      </div>
    );
  }
}
