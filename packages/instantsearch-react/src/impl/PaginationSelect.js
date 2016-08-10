import React from 'react';

import themeable from '../themeable';
import translatable from '../translatable';

import Pagination from './Pagination';
import Select from './Select';

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
})(
  translatable({
    previous: 'Previous page',
    next: 'Next page',
    first: 'First page',
    last: 'Last page',
    page: page => (page + 1).toString(),
    ariaPrevious: 'Previous page',
    ariaNext: 'Next page',
    ariaFirst: 'First page',
    ariaLast: 'Last page',
    ariaPage: page => `Page ${(page + 1).toString()}`,
  })(
    PaginationSelect
  )
);
