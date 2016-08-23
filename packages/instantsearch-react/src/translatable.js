import React from 'react';
import has from 'lodash/object/has';

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
      translations: withKeysPropType(Object.keys(defaultTranslations)),
    };

    return Translatable;
  };
}
