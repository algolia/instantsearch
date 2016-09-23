import React from 'react';
import reactThemeable from 'react-themeable';
import {omit} from 'lodash';

import {getDisplayName} from './utils';
import {withKeysPropType} from './propTypes';

export default function themeable(defaultTheme) {
  return Composed => {
    function Themeable(props) {
      const {theme = defaultTheme, ...otherProps} = props;
      const applyTheme = reactThemeable(theme);

      return <Composed {...otherProps} applyTheme={applyTheme} />;
    }

    Themeable.displayName = `Themeable(${getDisplayName(Composed)})`;

    Themeable.defaultTheme = defaultTheme;

    Themeable.propTypes = {
      theme: __DOC__ === 'yes' ?
        {type: {name: 'theme', value: defaultTheme}} :
        withKeysPropType(Object.keys(defaultTheme)),
    };

    if (__DOC__ === 'yes') {
      Themeable.propTypes = {
        ...omit(Composed.propTypes, 'applyTheme'),
        ...Themeable.propTypes,
      };
    }

    return Themeable;
  };
}
