import React from 'react';

import themeable from '../themeable';

import HitsPerPage from './HitsPerPage';
import Select from './Select';

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
