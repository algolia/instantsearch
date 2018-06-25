import React, { Component } from 'react';
import { has } from 'lodash';

const withKeysPropType = keys => (props, propName, componentName) => {
  const prop = props[propName];
  if (prop) {
    for (const key of Object.keys(prop)) {
      if (keys.indexOf(key) === -1) {
        return new Error(
          `Unknown \`${propName}\` key \`${key}\`. Check the render method ` +
            `of \`${componentName}\`.`
        );
      }
    }
  }
  return undefined;
};

export default function translatable(defaultTranslations) {
  return Composed => {
    class Translatable extends Component {
      translate = (key, ...params) => {
        const { translations } = this.props;

        const translation =
          translations && has(translations, key)
            ? translations[key]
            : defaultTranslations[key];

        if (typeof translation === 'function') {
          return translation(...params);
        }

        return translation;
      };

      render() {
        return <Composed translate={this.translate} {...this.props} />;
      }
    }

    const name = Composed.displayName || Composed.name || 'UnknownComponent';

    Translatable.displayName = `Translatable(${name})`;

    Translatable.propTypes = {
      translations: withKeysPropType(Object.keys(defaultTranslations)),
    };

    return Translatable;
  };
}
