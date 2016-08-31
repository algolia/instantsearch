import {PropTypes, Component, Children} from 'react';

export default class NoResults extends Component {
  static propTypes = {
    noResults: PropTypes.bool.isRequired,
    children: PropTypes.node,
  };

  render() {
    if (!this.props.noResults) {
      return null;
    }

    return Children.only(this.props.children);
  }
}
