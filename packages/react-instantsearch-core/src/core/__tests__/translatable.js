import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import translatable from '../translatable';

Enzyme.configure({ adapter: new Adapter() });

describe('translatable', () => {
  it('provides a translate prop to the composed component', () => {
    const Dummy = () => null;
    const defaultTranslations = {
      sup: 'hey',
      thing: (n) => `${n} things`,
    };
    const Translated = translatable(defaultTranslations)(Dummy);
    const { translate } = shallow(<Translated />)
      .find(Dummy)
      .props();
    expect(translate('sup')).toBe('hey');
    expect(translate('thing', 20)).toBe('20 things');
  });

  it('uses the translations passed as props before the default', () => {
    const Dummy = () => null;
    const defaultTranslations = {
      sup: 'hey',
      thing: (n) => `${n} things`,
      fallbackThing: 'hi',
    };
    const translations = {
      sup: 'hoy',
      fallbackThing: undefined,
    };
    const Translated = translatable(defaultTranslations)(Dummy);
    const { translate } = shallow(<Translated translations={translations} />)
      .find(Dummy)
      .props();
    expect(translate('sup')).toBe('hoy');
    expect(translate('thing', 20)).toBe('20 things');
    expect(translate('fallbackThing')).toBe(undefined);
  });
});
