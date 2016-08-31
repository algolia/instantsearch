/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import React from 'react';
import {shallow} from 'enzyme';

import translatable from './translatable';


describe('translatable', () => {
  it('provides a translate prop to the composed component', () => {
    const Dummy = () => null;
    const defaultTranslations = {
      sup: 'hey',
      thing: n => `${n} things`,
    };
    const Translated = translatable(defaultTranslations)(Dummy);
    const {translate} = shallow(<Translated />).find(Dummy).props();
    expect(translate('sup')).toBe('hey');
    expect(translate('thing', 20)).toBe('20 things');
  });

  it('uses the translations passed as props before the default', () => {
    const Dummy = () => null;
    const defaultTranslations = {
      sup: 'hey',
      thing: n => `${n} things`,
    };
    const translations = {
      sup: 'hoy',
    };
    const Translated = translatable(defaultTranslations)(Dummy);
    const {translate} = shallow(<Translated translations={translations} />).find(Dummy).props();
    expect(translate('sup')).toBe('hoy');
    expect(translate('thing', 20)).toBe('20 things');
  });
});
