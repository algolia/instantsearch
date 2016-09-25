import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import theme from './Error.css';

class Error extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    error: PropTypes.instanceOf(Error).isRequired,
  };

  render() {
    const {applyTheme, translate, error} = this.props;
    return (
      <div {...applyTheme('root', 'root')}>
        {translate('error', error)}
      </div>
    );
  }
}

export default themeable(theme)(
  translatable({
    error: 'There was an error processing your request. Please try again.',
  })(Error)
);
