import {PropTypes, Component, Children} from 'react';
import {findDOMNode} from 'react-dom';
import connect from 'algoliasearch-helper-provider/src/connect';

class ScrollTo extends Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    children: PropTypes.node,
  };

  componentDidUpdate(prevProps) {
    const {page} = this.props;
    if (page !== prevProps.page) {
      const el = findDOMNode(this);
      el.scrollIntoView();
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default connect(state => ({
  page: state.searchParameters.page,
}))(ScrollTo);
