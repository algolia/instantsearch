import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component, createContext } from 'react';

import { createClassNames } from '../core/utils';

const cx = createClassNames('Panel');

export const { Consumer: PanelConsumer, Provider: PanelProvider } =
  createContext(function setCanRefine() {});

class Panel extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    header: PropTypes.node,
    footer: PropTypes.node,
  };

  static defaultProps = {
    className: '',
    header: null,
    footer: null,
  };

  state = {
    canRefine: true,
  };

  setCanRefine = (nextCanRefine) => {
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

        <div className={cx('body')}>
          <PanelProvider value={this.setCanRefine}>{children}</PanelProvider>
        </div>

        {footer && <div className={cx('footer')}>{footer}</div>}
      </div>
    );
  }
}

export default Panel;
