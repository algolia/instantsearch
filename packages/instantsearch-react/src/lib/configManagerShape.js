import {PropTypes} from 'react';

export default PropTypes.shape({
  register: PropTypes.func.isRequired,
  swap: PropTypes.func.isRequired,
  unregister: PropTypes.func.isRequired,
  apply: PropTypes.func.isRequired,
});
