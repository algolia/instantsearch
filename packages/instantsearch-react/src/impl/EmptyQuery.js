import {PropTypes, Component, Children} from 'react';

export default class EmptyQuery extends Component {
  static propTypes = {
    emptyQuery: PropTypes.bool.isRequired,
    children: PropTypes.node,
  };

  render() {
    if (!this.props.emptyQuery) {
      return null;
    }

    return Children.only(this.props.children);
  }
}
