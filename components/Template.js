let React = require('react');
let mapValues = require('lodash/object/mapValues');
let curry = require('lodash/function/curry');
let hogan = require('hogan.js');

class Template extends React.Component {
  render() {
    let compileOptions = this.props.useCustomCompileOptions[this.props.templateKey] ?
      this.props.templatesConfig.compileOptions :
      {};

    let content = renderTemplate({
      template: this.props.templates[this.props.templateKey],
      compileOptions: compileOptions,
      helpers: this.props.templatesConfig.helpers,
      data: transformData(this.props.transformData, this.props.templateKey, this.props.data)
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    return <div className={this.props.cssClass} dangerouslySetInnerHTML={{__html: content}} />;
  }
}

Template.propTypes = {
  cssClass: React.PropTypes.string,
  data: React.PropTypes.object,
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

  let data;
  if (typeof fn === 'function') {
    data = fn(originalData);
  } else if (typeof fn === 'object') {
    // ex: transformData: {hit, empty}
    if (fn[templateKey]) {
      data = fn[templateKey](originalData);
    } else {
      // if the templateKey doesn't exist, just use the
      // original data
      data = originalData;
    }
  } else {
    throw new Error('`transformData` must be a function or an object');
  }

  let dataType = typeof data;
  let expectedType = typeof originalData;
  if (dataType !== expectedType) {
    throw new Error(`\`transformData\` must return a \`${expectedType}\`, got \`${dataType}\`.`);
  }
  return data;
}

function renderTemplate({template, compileOptions, helpers, data}) {
  let isTemplateString = typeof template === 'string';
  let isTemplateFunction = typeof template === 'function';

  if (!isTemplateString && !isTemplateFunction) {
    throw new Error('Template must be `string` or `function`');
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

module.exports = Template;
