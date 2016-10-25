import {PropTypes, Component, Children} from 'react';

export default class Loading extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node,
  };

  render() {
    if (!this.props.loading) {
      return null;
    }

    return Children.only(this.props.children);
  }
}
