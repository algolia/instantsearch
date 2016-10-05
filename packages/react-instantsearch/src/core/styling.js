import _ from 'lodash';

/**
 * This function allow a user to add his own class names to the one that are used for the default theming.
 * It's useful if you want to take advantage of all the default theme but must change colors for example.
 *
 * This function retrieve from a Component the default theme, and recreate a new object based on the default theme keys.
 * If a key is present in the new provided theme, it will get the corresponding class name and add it to new object next to
 * the default one.
 *
 * @param {Object} baseTheme the object containing the base theme
 * @param {Object} newTheme the object containing new class names that will be merged.
 * @returns {Object} A new object containing both base and new class names.
 */
export default function mergeClassNames(baseTheme, newTheme) {
  return _.entries(baseTheme).reduce((acc, i) => {
    const key = i[0];
    const defaultClassName = i[1];
    const newClassName = newTheme[key] ? ` ${newTheme[key]}` : '';
    acc[key] = `${defaultClassName}${newClassName}`;
    return acc;
  }, {});
}
