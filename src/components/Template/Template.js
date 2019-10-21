/** @jsx h */

import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { renderTemplate, isEqual } from '../../lib/utils';

class Template extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      !isEqual(this.props.data, nextProps.data) ||
      this.props.templateKey !== nextProps.templateKey ||
      !isEqual(this.props.rootProps, nextProps.rootProps)
    );
  }

  render() {
    const RootTagName = this.props.rootTagName;
    const useCustomCompileOptions = this.props.useCustomCompileOptions[
      this.props.templateKey
    ];
    const compileOptions = useCustomCompileOptions
      ? this.props.templatesConfig.compileOptions
      : {};

    const content = renderTemplate({
      templates: this.props.templates,
      templateKey: this.props.templateKey,
      compileOptions,
      helpers: this.props.templatesConfig.helpers,
      data: this.props.data,
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    return (
      <RootTagName
        {...this.props.rootProps}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
}

Template.propTypes = {
  data: PropTypes.object,
  rootProps: PropTypes.object,
  rootTagName: PropTypes.string,
  templateKey: PropTypes.string,
  templates: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.func])
  ),
  templatesConfig: PropTypes.shape({
    helpers: PropTypes.objectOf(PropTypes.func),
    // https://github.com/twitter/hogan.js/#compilation-options
    compileOptions: PropTypes.shape({
      asString: PropTypes.bool,
      sectionTags: PropTypes.arrayOf(
        PropTypes.shape({
          o: PropTypes.string,
          c: PropTypes.string,
        })
      ),
      delimiters: PropTypes.string,
      disableLambda: PropTypes.bool,
    }),
  }),
  useCustomCompileOptions: PropTypes.objectOf(PropTypes.bool),
};

Template.defaultProps = {
  data: {},
  rootTagName: 'div',
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {},
};

export default Template;
