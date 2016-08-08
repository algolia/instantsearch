import React, {PropTypes, Component} from 'react';

class HitsPerPage extends Component {
  static propTypes = {
    hitsPerPage: PropTypes.number,
    refine: PropTypes.func.isRequired,
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      })),
      PropTypes.arrayOf(PropTypes.number),
    ]).isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.value);
  };

  render() {
    const {hitsPerPage, items} = this.props;

    return (
      <select value={hitsPerPage} onChange={this.onChange}>
        {items.map(item => {
          let value;
          let label;
          if (typeof item === 'number') {
            value = item;
            label = item;
          } else {
            value = item.value;
            label = item.label;
          }
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }
}

export default HitsPerPage;
