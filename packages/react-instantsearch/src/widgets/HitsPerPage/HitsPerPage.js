import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';

import LinkList from '../../components/LinkList';

import theme from './HitsPerPage.css';

class HitsPerPage extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    hitsPerPage: PropTypes.number.isRequired,
    applyTheme: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,

    /**
     * List of hits per page options.
     * Passing a list of numbers `[n]` is a shorthand for `[{value: n, label: n}]`.
     * @public
     * @defines HitsPerPageItem
     */
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(
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
      PropTypes.arrayOf(PropTypes.number),
    ]),
  };

  render() {
    const {
      hitsPerPage,
      refine,
      items,
      applyTheme,
      createURL,
    } = this.props;

    return (
      <LinkList
        items={items.map(item =>
          typeof item === 'number' ? {value: item, label: item} : item
        )}
        onSelect={refine}
        selectedItem={hitsPerPage}
        applyTheme={applyTheme}
        createURL={createURL}
      />
    );
  }
}

export default themeable(theme)(HitsPerPage);
