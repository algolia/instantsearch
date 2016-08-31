import {PropTypes, Component, Children} from 'react';
import {findDOMNode} from 'react-dom';

class ScrollTo extends Component {
  static propTypes = {
    value: PropTypes.any,
    children: PropTypes.node,
  };

  componentDidUpdate(prevProps) {
    const {value} = this.props;
    if (value !== prevProps.value) {
      const el = findDOMNode(this);
      el.scrollIntoView();
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default ScrollTo;
