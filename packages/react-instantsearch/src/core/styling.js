import _ from 'lodash';
import insertCss from 'insert-css';
import CSSPropertyOperations from 'react/lib/CSSPropertyOperations';

const buildExtendedStylesheet = (defaultClassNames, inlineStyles) => {
  let extendedStylesheet = '';
  _.entries(inlineStyles).forEach(e => {
    const [themeKey, styles] = e;
    if (defaultClassNames[themeKey]) {
      const className = `${defaultClassNames[themeKey]}--ext`;
      extendedStylesheet += `\n\n .${className} {\n `;
      extendedStylesheet += CSSPropertyOperations.createMarkupForStyles(styles);
      extendedStylesheet += '\n}\n';
    } else {
      throw new
        Error(`Warning: the ${e[0]} themeKey doesn't not existing in the default theme. Its style can't be applied`);
    }
  });
  return extendedStylesheet;
};

const addExtendThemeClassNamesToDefaultTheme = (defaultClassNames, inlineStyles) =>
  _.entries(defaultClassNames).reduce((acc, e) => {
    const [themeKey, defaultClassName] = e;
    const extendedThemeClassName = inlineStyles[themeKey] ? ` ${defaultClassNames[themeKey]}--ext` : '';
    acc[themeKey] = `${defaultClassName}${extendedThemeClassName}`;
    return acc;
  }, {});

/**
 * This function allow a user to extend a default theme by providing inline styles.
 * see: https://facebook.github.io/react/tips/inline-styles.html
 *
 * This function is useful if you want to take advantage of all the default theme properties but must change colors for example.
 *
 * This function takes the default classNames of a component and the inline styles that will be used to extend it. It will inject into
 * the page the new css and will return a new theme to be used by the component. This new theme contains both default classNames
 * and the extended ones.
 *
 * @param {Object} defaultClassNames the object containing the default theme of a component.
 * @param {Object} inlineStyles the object containing inline styles that will be applied.
 * @returns {Object} A new object containing both default and extended class names.
 */
export default function extendTheme(defaultClassNames, inlineStyles) {
  const extendedStyleSheet = buildExtendedStylesheet(defaultClassNames, inlineStyles);

  insertCss(extendedStyleSheet);

  return addExtendThemeClassNamesToDefaultTheme(defaultClassNames, inlineStyles);
}

