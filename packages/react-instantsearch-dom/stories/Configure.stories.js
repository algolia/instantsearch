import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Configure} from '../packages/react-instantsearch/dom';
import {WrapWithHits} from './util';

const stories = storiesOf('Configure', module);

stories.add('default', () =>
  <ConfigureExample />
);

class ConfigureExample extends React.Component {
  constructor() {
    super();
    this.state = {hitsPerPage: 3};
  }
  onClick() {
    const hitsPerPage = this.state.hitsPerPage === 3 ? 1 : 3;
    this.setState({hitsPerPage});
  }
  render() {
    return <WrapWithHits>
      <Configure hitsPerPage={this.state.hitsPerPage} />
      <button onClick={this.onClick.bind(this)}>Toggle HitsPerPage</button>
    </WrapWithHits>;
  }
}
