/** @jsx h */

import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

class Panel extends Component {
  state = {
    collapsed: this.props.collapsed,
    controlled: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!prevState.controlled && nextProps.collapsed !== prevState.collapsed) {
      return {
        collapsed: nextProps.collapsed,
      };
    }

    return null;
  }

  componentDidMount() {
    this.bodyRef.appendChild(this.props.bodyElement);
  }

  render() {
    const { cssClasses, hidden, collapsible, templateProps, data } = this.props;

    return (
      <div
        className={cx(cssClasses.root, {
          [cssClasses.noRefinementRoot]: hidden,
          [cssClasses.collapsibleRoot]: collapsible,
          [cssClasses.collapsedRoot]: this.state.collapsed,
        })}
        hidden={hidden}
      >
        {templateProps.templates.header && (
          <div className={cssClasses.header}>
            <Template
              {...templateProps}
              templateKey="header"
              rootTagName="span"
              data={data}
            />

            {collapsible && (
              <button
                className={cssClasses.collapseButton}
                aria-expanded={!this.state.collapsed}
                onClick={event => {
                  event.preventDefault();

                  this.setState(previousState => ({
                    controlled: true,
                    collapsed: !previousState.collapsed,
                  }));
                }}
              >
                <Template
                  {...templateProps}
                  templateKey="collapseButtonText"
                  rootTagName="span"
                  data={{ collapsed: this.state.collapsed }}
                />
              </button>
            )}
          </div>
        )}

        <div className={cssClasses.body} ref={node => (this.bodyRef = node)} />

        {templateProps.templates.footer && (
          <Template
            {...templateProps}
            templateKey="footer"
            rootProps={{
              className: cssClasses.footer,
            }}
            data={data}
          />
        )}
      </div>
    );
  }
}

Panel.propTypes = {
  bodyElement: PropTypes.instanceOf(Element).isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    noRefinementRoot: PropTypes.string.isRequired,
    collapsibleRoot: PropTypes.string.isRequired,
    collapsedRoot: PropTypes.string.isRequired,
    collapseButton: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
  }).isRequired,
  templateProps: PropTypes.shape({
    templates: PropTypes.object.isRequired,
  }).isRequired,
  hidden: PropTypes.bool.isRequired,
  collapsed: PropTypes.bool.isRequired,
  collapsible: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
};

export default Panel;
