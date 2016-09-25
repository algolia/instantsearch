import _ from 'lodash';

/**
 * This function allow a user to add his own class names to the one that are used for the default theming.
 * It's useful if you want to take advantage of all the default theme but must change colors for example.
 *
 * This function retrieve from a Component the default theme, and recreate a new object based on the default theme keys.
 * If a key is present in the new provided theme, it will get the corresponding class name and add it to new object next to
 * the default one.
 *
 * @param {Component} Component the react component for overriding its theme.
 * @param {Object} theme A new theme object containing both default and new class names.
 * @returns {Object} the user theme containing the new class names.
 */
export default function overrideTheme(Component, theme) {
  if (!Component.defaultTheme) {
    throw new Error(`Component ${Component.displayName} does not have a default theme to override`);
  }
  return _.entries(Component.defaultTheme).reduce((acc, i) => {
    const key = i[0];
    const defaultClassName = i[1];
    const newClassName = theme[key] ? ` ${theme[key]}` : '';
    acc[key] = `${defaultClassName}${newClassName}`;
    return acc;
  }, {});
}
