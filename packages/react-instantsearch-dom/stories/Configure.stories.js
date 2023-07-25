import { storiesOf } from '@storybook/react';
import React from 'react';
import { Configure } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('Configure', module);

class ConfigureExample extends React.Component {
  constructor() {
    super();
    this.state = { hitsPerPage: 3 };
  }

  onClick = () => {
    const hitsPerPage = this.state.hitsPerPage === 3 ? 1 : 3;
    this.setState({ hitsPerPage });
  };

  render() {
    return (
      <WrapWithHits linkedStoryGroup="Configure.stories.js">
        <Configure hitsPerPage={this.state.hitsPerPage} />
        <button onClick={this.onClick}>Toggle HitsPerPage</button>
      </WrapWithHits>
    );
  }
}

stories.add('default', () => <ConfigureExample />);
