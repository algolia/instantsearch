import React from 'react';

export default function translatable(defaultTranslations) {
  return Composed => {
    function Translatable(props) {
      const {translations, ...otherProps} = props;
      const translate = (key, ...params) => {
        const translation =
          translations && {}.hasOwnProperty.call(translations, key) ?
            translations[key] :
            defaultTranslations[key];
        if (typeof translation === 'function') {
          return translation(...params);
        }
        return translation;
      };

      return <Composed {...otherProps} translate={translate} />;
    }

    Translatable.propTypes = {
      translations(props, propName, componentName) {
        const translations = props[propName];
        if (translations) {
          for (const key of Object.keys(translations)) {
            if (!{}.hasOwnProperty.call(defaultTranslations, key)) {
              return new Error(
                `Unknown translation key \`${key}\`. Check the render method ` +
                `of \`${componentName}\`.`
              );
            }
          }
        }
        return undefined;
      },
    };

    return Translatable;
  };
}
