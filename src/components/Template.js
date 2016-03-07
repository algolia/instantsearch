import React from 'react';

import curry from 'lodash/function/curry';
import cloneDeep from 'lodash/lang/cloneDeep';
import mapValues from 'lodash/object/mapValues';

import hogan from 'hogan.js';

import isEqual from 'lodash/lang/isEqual';

class Template extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.data, nextProps.data) || this.props.templateKey !== nextProps.templateKey;
  }

  render() {
    const useCustomCompileOptions = this.props.useCustomCompileOptions[this.props.templateKey];
    const compileOptions = useCustomCompileOptions ? this.props.templatesConfig.compileOptions : {};

    const content = renderTemplate({
      templates: this.props.templates,
      templateKey: this.props.templateKey,
      compileOptions: compileOptions,
      helpers: this.props.templatesConfig.helpers,
      data: transformData(this.props.transformData, this.props.templateKey, this.props.data)
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    if (React.isValidElement(content)) {
      return <div {...this.props.rootProps}>{content}</div>;
    }

    return <div {...this.props.rootProps} dangerouslySetInnerHTML={{__html: content}} />;
  }
}

Template.propTypes = {
  data: React.PropTypes.object,
  rootProps: React.PropTypes.object,
  templateKey: React.PropTypes.string,
  templates: React.PropTypes.objectOf(React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ])),
  templatesConfig: React.PropTypes.shape({
    helpers: React.PropTypes.objectOf(React.PropTypes.func),
    // https://github.com/twitter/hogan.js/#compilation-options
    compileOptions: React.PropTypes.shape({
      asString: React.PropTypes.bool,
      sectionTags: React.PropTypes.arrayOf(React.PropTypes.shape({
        o: React.PropTypes.string,
        c: React.PropTypes.string
      })),
      delimiters: React.PropTypes.string,
      disableLambda: React.PropTypes.bool
    })
  }),
  transformData: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.objectOf(React.PropTypes.func)
  ]),
  useCustomCompileOptions: React.PropTypes.objectOf(React.PropTypes.bool)
};

Template.defaultProps = {
  data: {},
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {}
};

function transformData(fn, templateKey, originalData) {
  if (!fn) {
    return originalData;
  }

  let clonedData = cloneDeep(originalData);

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
    throw new Error(`transformData must be a function or an object, was ${typeFn} (key : ${templateKey})`);
  }

  let dataType = typeof data;
  let expectedType = typeof originalData;
  if (dataType !== expectedType) {
    throw new Error(`\`transformData\` must return a \`${expectedType}\`, got \`${dataType}\`.`);
  }
  return data;
}

function renderTemplate({templates, templateKey, compileOptions, helpers, data}) {
  const template = templates[templateKey];
  const templateType = typeof template;
  const isTemplateString = templateType === 'string';
  const isTemplateFunction = templateType === 'function';

  if (!isTemplateString && !isTemplateFunction) {
    throw new Error(`Template must be 'string' or 'function', was '${templateType}' (key: ${templateKey})`);
  } else if (isTemplateFunction) {
    return template(data);
  } else {
    let transformedHelpers = transformHelpersToHogan(helpers, compileOptions, data);
    let preparedData = {...data, helpers: transformedHelpers};
    return hogan.compile(template, compileOptions).render(preparedData);
  }
}

// We add all our template helper methods to the template as lambdas. Note
// that lambdas in Mustache are supposed to accept a second argument of
// `render` to get the rendered value, not the literal `{{value}}`. But
// this is currently broken (see
// https://github.com/twitter/hogan.js/issues/222).
function transformHelpersToHogan(helpers, compileOptions, data) {
  return mapValues(helpers, (method) => {
    return curry(function(text) {
      let render = (value) => hogan.compile(value, compileOptions).render(this);
      return method.call(data, text, render);
    });
  });
}

export default Template;
