import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import Template from '../Template';
import { isSpecialClick } from '../../lib/utils';

export default class RawClearRefinements extends Component {
  componentWillMount() {
    this.handleClick = this.handleClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.url !== nextProps.url ||
      this.props.hasRefinements !== nextProps.hasRefinements
    );
  }

  handleClick(e) {
    if (isSpecialClick(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }
    e.preventDefault();
    this.props.refine();
  }

  render() {
    const { hasRefinements, cssClasses } = this.props;
    const data = { hasRefinements };

    const className =
      !hasRefinements && cssClasses.disabledButton
        ? `${cssClasses.button} ${cssClasses.disabledButton}`
        : cssClasses.button;

    return (
      <div className={cssClasses.root}>
        <Template
          rootTagName="button"
          rootProps={{
            className,
            href: this.props.url,
            onClick: this.handleClick,
            disabled: !hasRefinements,
          }}
          data={data}
          templateKey="button"
          {...this.props.templateProps}
        />
      </div>
    );
  }
}

RawClearRefinements.propTypes = {
  refine: PropTypes.func.isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string,
    button: PropTypes.string,
    disabledButton: PropTypes.string,
  }),
  hasRefinements: PropTypes.bool.isRequired,
  templateProps: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
};
