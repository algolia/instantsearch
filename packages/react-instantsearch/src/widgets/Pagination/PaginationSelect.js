import React from 'react';
import {omit} from 'lodash';

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

if (__DOC__ === 'yes') {
  PaginationSelect.propTypes = omit(
    Pagination.propTypes,
    'showFirst',
    'showPrevious',
    'showNext',
    'showLast'
  );
}

export default themeable({
  root: 'PaginationSelect',
})(PaginationSelect);
