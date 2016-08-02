import React from 'react';
import reactThemeable from 'react-themeable';

export default function themeable(defaultTheme) {
  return Composed => {
    function Themeable(props) {
      const {theme = defaultTheme, ...otherProps} = props;
      const applyTheme = reactThemeable(theme);

      return <Composed {...otherProps} applyTheme={applyTheme} />;
    }

    Themeable.propTypes = {
      theme(props, propName, componentName) {
        const prop = props[propName];
        if (prop) {
          for (const key of Object.keys(prop)) {
            if (!{}.hasOwnProperty.call(defaultTheme, key)) {
              return new Error(
                `Unknown theme key \`${key}\`. Check the render method of ` +
                `\`${componentName}\`.`
              );
            }
          }
        }
        return undefined;
      },
    };

    return Themeable;
  };
}
