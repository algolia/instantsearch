import React from 'react';

import themeable from '../../core/themeable';

import Pagination from './Pagination';
import Select from '../../components/Select';

function PaginationSelect(props) {
  return (
    <Pagination
      {...props}
      listComponent={Select}
      showFirst={false}
      showPrevious={false}
      showNext={false}
      showLast={false}
    />
  );
}

export default themeable({
  root: 'PaginationSelect',
})(PaginationSelect);
