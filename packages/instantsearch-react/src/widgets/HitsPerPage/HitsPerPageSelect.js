import React from 'react';

import themeable from '../../core/themeable';

import HitsPerPage from './HitsPerPage';
import Select from '../../components/Select';

function HitsPerPageSelect(props) {
  return (
    <HitsPerPage
      {...props}
      listComponent={Select}
    />
  );
}

export default themeable({
  root: 'HitsPerPageSelect',
})(HitsPerPageSelect);
