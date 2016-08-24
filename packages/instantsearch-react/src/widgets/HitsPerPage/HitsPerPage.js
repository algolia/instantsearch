import React, {PropTypes, Component} from 'react';

export default class HitsPerPage extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,

    hitsPerPage: PropTypes.number.isRequired,
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.arrayOf(PropTypes.number),
    ]).isRequired,

    listComponent: PropTypes.func.isRequired,
  };

  render() {
    const {
      hitsPerPage,
      items,
      listComponent: ListComponent,
      refine,
      ...otherProps,
    } = this.props;

    return (
      <ListComponent
        {...otherProps}
        onSelect={refine}
        selectedItem={hitsPerPage}
        items={items.map(item =>
          typeof item === 'number' ?
            {value: item, label: item.toString()} :
            item
        )}
      />
    );
  }
}
