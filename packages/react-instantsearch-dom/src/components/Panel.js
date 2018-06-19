import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { createClassNames } from '../core/utils';

const cx = createClassNames('Panel');

class Panel extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    header: PropTypes.node,
    footer: PropTypes.node,
  };

  static childContextTypes = {
    setCanRefine: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: '',
    header: null,
    footer: null,
  };

  state = {
    canRefine: true,
  };

  getChildContext() {
    return {
      setCanRefine: this.setCanRefine,
    };
  }

  setCanRefine = nextCanRefine => {
    this.setState({ canRefine: nextCanRefine });
  };

  render() {
    const { children, className, header, footer } = this.props;
    const { canRefine } = this.state;

    return (
      <div
        className={classNames(cx('', !canRefine && '-noRefinement'), className)}
      >
        {header && <div className={cx('header')}>{header}</div>}

        <div className={cx('body')}>{children}</div>

        {footer && <div className={cx('footer')}>{footer}</div>}
      </div>
    );
  }
}

export default Panel;
