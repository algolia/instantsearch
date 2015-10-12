var React = require('react');

class Template extends React.Component {
  render() {
    var content = renderTemplate({
      template: this.props.templates[this.props.templateKey],
      compileOptions: this.props.useCustomCompileOptions[this.props.templateKey] ?
        this.props.templatesConfig.compileOptions :
        {},
      helpers: this.props.templatesConfig.helpers,
      data: transformData(this.props.transformData, this.props.templateKey, this.props.data)
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
}

Template.propTypes = {
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
  data: {}
};

function transformData(fn, templateKey, originalData) {
  if (!fn) {
    return originalData;
  }

  if (typeof fn === 'function') {
    return fn(originalData);
  } else if (typeof fn === 'object') {
    // ex: transformData: {hit, empty}
    return fn[templateKey] && fn[templateKey](originalData) || originalData;
  }

  throw new Error('`transformData` must be a function or an object');
}

function renderTemplate({template, compileOptions, helpers, data}) {
  var hogan = require('hogan.js');
  var forOwn = require('lodash/object/forOwn');
  var content;

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error('Template must be `string` or `function`');
  }

  if (typeof template === 'function') {
    content = template(data);
  }

  if (typeof template === 'string') {
    data = addTemplateHelpersToData(data);

    content = hogan.compile(template, compileOptions).render(data);
  }

  // We add all our template helper methods to the template as lambdas. Note
  // that lambdas in Mustache are supposed to accept a second argument of
  // `render` to get the rendered value, not the literal `{{value}}`. But
  // this is currently broken (see
  // https://github.com/twitter/hogan.js/issues/222).
  function addTemplateHelpersToData(templateData) {
    templateData.helpers = {};
    forOwn(helpers, (method, name) => {
      templateData.helpers[name] = function() {
        return (text) => {
          var render = (value) => hogan.compile(value, compileOptions).render(this);
          return method.call(this, text, render);
        };
      };
    });
    return data;
  }

  return content;
}

module.exports = Template;
