import React from 'react';
import reactThemeable from 'react-themeable';
import {omit} from 'lodash';

import {getDisplayName} from './utils';
import {withKeysPropType} from './propTypes';
import insertCss from 'insert-css';

export default function themeable(defaultTheme) {
  let defaultClassNames = defaultTheme;

  if (defaultTheme.classNames !== undefined) {
    defaultClassNames = defaultTheme.classNames;
  }

  if (defaultTheme.code !== undefined) {
    insertCss(defaultTheme.code, {prepend: true});
  }

  return Composed => {
    function Themeable(props) {
      const {theme = defaultClassNames, ...otherProps} = props;
      const applyTheme = reactThemeable(theme);

      return <Composed {...otherProps} applyTheme={applyTheme} />;
    }

    Themeable.displayName = `Themeable(${getDisplayName(Composed)})`;

    Themeable.defaultClassNames = defaultClassNames;

    Themeable.propTypes = {
      theme: __DOC__ === 'yes' ?
        {type: {name: 'theme', value: defaultClassNames}} :
        withKeysPropType(Object.keys(defaultClassNames)),
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
