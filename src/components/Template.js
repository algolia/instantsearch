import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { isReactElement, renderTemplate } from '../lib/utils';

export class PureTemplate extends Component {
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

    if (isReactElement(content)) {
      throw new Error(
        'Support for templates as React elements has been removed, please use react-instantsearch'
      );
    }

    return (
      <RootTagName
        {...this.props.rootProps}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
}

PureTemplate.propTypes = {
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
  transformData: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.objectOf(PropTypes.func),
  ]),
  useCustomCompileOptions: PropTypes.objectOf(PropTypes.bool),
};

PureTemplate.defaultProps = {
  data: {},
  rootTagName: 'div',
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {},
};

function transformData(fn, templateKey, originalData) {
  if (!fn) {
    return originalData;
  }

  const clonedData = cloneDeep(originalData);

  let data;
  const typeFn = typeof fn;
  if (typeFn === 'function') {
    data = fn(clonedData);
  } else if (typeFn === 'object') {
    // ex: transformData: {hit, empty}
    if (fn[templateKey]) {
      data = fn[templateKey](clonedData);
    } else {
      // if the templateKey doesn't exist, just use the
      // original data
      data = originalData;
    }
  } else {
    throw new Error(
      `transformData must be a function or an object, was ${typeFn} (key : ${templateKey})`
    );
  }

  const dataType = typeof data;
  const expectedType = typeof originalData;
  if (dataType !== expectedType) {
    throw new Error(
      `\`transformData\` must return a \`${expectedType}\`, got \`${dataType}\`.`
    );
  }
  return data;
}

// Resolve transformData before Template, so transformData is always called
// even if the data is the same. Allowing you to dynamically inject conditions in
// transformData that will force re-rendering
const withTransformData = TemplateToWrap => props => {
  const data = props.data === undefined ? {} : props.data; // eslint-disable-line react/prop-types
  return (
    <TemplateToWrap
      {...props}
      data={transformData(props.transformData, props.templateKey, data)} // eslint-disable-line react/prop-types
    />
  );
};

export default withTransformData(PureTemplate);
