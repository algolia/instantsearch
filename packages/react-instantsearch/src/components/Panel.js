import React, {PropTypes, Component} from 'react';
import classNames from './classNames.js';

const cx = classNames('Panel');

class Panel extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  static childContextTypes = {
    canRefine: PropTypes.func,
  };

  getChildContext() {
    return {canRefine: this.canRefine};
  }

  constructor(props) {
    super(props);
    this.state = {canRefine: true};
    this.canRefine = canRefine => {
      this.setState({canRefine});
    };
  }
  render() {
    return <div {...cx('root', !this.state.canRefine && 'noRefinement')}>
      <h5 {...cx('title')}>{this.props.title}</h5>
      {this.props.children}
    </div>;
  }
}

export default Panel;
