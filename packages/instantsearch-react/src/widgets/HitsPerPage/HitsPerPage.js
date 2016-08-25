import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';

import LinkList from '../../components/LinkList';

class HitsPerPage extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    hitsPerPage: PropTypes.number.isRequired,
    
    /**
     * List of hits per page options.
     * @shape HitsPerPageItem
     */
    items: PropTypes.arrayOf(
      PropTypes.shape({
        /**
         * Number of hits to display.
         */
        value: PropTypes.number.isRequired,

        /**
         * Node to render in place of the option item.
         */
        label: PropTypes.node,
      })
    ),
  };

  render() {
    const {
      hitsPerPage,
      refine,
      items,
    } = this.props;

    return (
      <LinkList
        items={items}
        onSelect={refine}
        selectedItem={hitsPerPage}
      />
    );
  }
}

export default themeable({
  root: 'HitsPerPage',
  item: 'HitsPerPage__item',
  itemLink: 'HitsPerPage__item__link',
  itemSelected: 'HitsPerPage__item--selected',
})(HitsPerPage);
