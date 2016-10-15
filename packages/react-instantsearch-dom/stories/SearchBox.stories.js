import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {SearchBox, extendTheme} from '../packages/react-instantsearch';
import {withKnobs, object} from '@kadira/storybook-addon-knobs';
import Wrapper from './util';

const stories = storiesOf('SearchBox', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <Wrapper >
    <SearchBox/>
  </Wrapper>
).add('extend theme', () =>
  <Wrapper >
    <SearchBox
      theme={extendTheme(SearchBox.defaultClassNames, {
        submit: {
          backgroundColor: 'red',
        },
      })}
    />
  </Wrapper>
).add('playground', () =>
  <Wrapper >
    <SearchBox
      translations={object('translate', {
        submit: null,
        reset: null,
        submitTitle: 'Submit your search query.',
        resetTitle: 'Clear your search query.',
        placeholder: 'Search your website.',
      })}
    />
  </Wrapper>
);
