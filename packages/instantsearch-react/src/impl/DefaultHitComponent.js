import React, {PropTypes, Component} from 'react';

export default class DefaultHitComponent extends Component {
  static propTypes = {
    hit: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div>
        {JSON.stringify(this.props.hit)}
      </div>
    );
  }
}
