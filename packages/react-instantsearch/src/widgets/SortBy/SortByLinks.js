import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';

import LinkList from '../../components/LinkList';

import theme from './SortByLinks.css';

class SortByLinks extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,

    /**
     * The different options, with the corresponding index.
     * @public
     * @defines SortByLinksItem
     */
    items: PropTypes.arrayOf(PropTypes.shape({
      /**
       * Node to render in place of the option item.
       */
      label: PropTypes.node.isRequired,
      /**
       * Index to use
       */
      value: PropTypes.string.isRequired,
    })).isRequired,

    selectedIndex: PropTypes.string.isRequired,
  };

  render() {
    const {applyTheme, refine, createURL, items, selectedIndex} = this.props;

    return (
      <LinkList
        applyTheme={applyTheme}
        items={items}
        selectedItem={selectedIndex}
        onSelect={refine}
        createURL={createURL}
      />
    );
  }
}

export default themeable(theme)(SortByLinks);
