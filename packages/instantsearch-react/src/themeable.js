import React from 'react';
import reactThemeable from 'react-themeable';

import {withKeysPropType} from './propTypes';

export default function themeable(defaultTheme) {
  return Composed => {
    function Themeable(props) {
      const {theme = defaultTheme, ...otherProps} = props;
      const applyTheme = reactThemeable(theme);

      return <Composed {...otherProps} applyTheme={applyTheme} />;
    }

    Themeable.propTypes = {
      theme: withKeysPropType(Object.keys(defaultTheme)),
    };

    return Themeable;
  };
}
