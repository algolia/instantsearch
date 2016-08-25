import React from 'react';

import themeable from '../../core/themeable';

import HitsPerPage from './HitsPerPage';
import LinkList from '../../components/LinkList';

function HitsPerPageLinks(props) {
  return (
    <HitsPerPage
      {...props}
      listComponent={LinkList}
    />
  );
}

export default themeable({
  root: 'HitsPerPage',
  item: 'HitsPerPage__item',
  itemLink: 'HitsPerPage__item__link',
  itemSelected: 'HitsPerPage__item--selected',
})(HitsPerPageLinks);
