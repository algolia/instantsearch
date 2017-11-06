import React from 'react';
import { storiesOf } from '@storybook/react';
import { Configure } from '../packages/react-instantsearch/dom';
import { WrapWithHits } from './util';
import { checkA11y } from 'storybook-addon-a11y';

const stories = storiesOf('Configure', module);

stories.addDecorator(checkA11y).add('default', () => <ConfigureExample />);

class ConfigureExample extends React.Component {
  constructor() {
    super();
    this.state = { hitsPerPage: 3 };
  }

  onClick() {
    const hitsPerPage = this.state.hitsPerPage === 3 ? 1 : 3;
    this.setState({ hitsPerPage });
  }

  render() {
    return (
      <WrapWithHits linkedStoryGroup="Configure">
        <Configure hitsPerPage={this.state.hitsPerPage} />
        <button onClick={this.onClick.bind(this)}>Toggle HitsPerPage</button>
      </WrapWithHits>
    );
  }
}
