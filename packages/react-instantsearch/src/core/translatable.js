import React from 'react';
import {omit, has} from 'lodash';

import {getDisplayName} from './utils';
import {withKeysPropType} from './propTypes';

export default function translatable(defaultTranslations) {
  return Composed => {
    function Translatable(props) {
      const {translations, ...otherProps} = props;
      const translate = (key, ...params) => {
        const translation =
          translations && has(translations, key) ?
            translations[key] :
            defaultTranslations[key];
        if (typeof translation === 'function') {
          return translation(...params);
        }
        return translation;
      };

      return <Composed {...otherProps} translate={translate} />;
    }

    Translatable.displayName = `Translatable(${getDisplayName(Composed)})`;

    Translatable.propTypes = {
      translations: __DOC__ ?
        {type: {name: 'translations', value: defaultTranslations}} :
        withKeysPropType(Object.keys(defaultTranslations)),
    };

    if (__DOC__) {
      Translatable.propTypes = {
        ...omit(Composed.propTypes, 'translate'),
        ...Translatable.propTypes,
      };
    }

    return Translatable;
  };
}
