var React = require('react');

var renderTemplate = require('../lib/utils').renderTemplate;

class Template {
  render() {
    var content = renderTemplate({
      template: this.props.templates[this.props.templateKey],
      compileOptions: this.props.useCustomCompileOptions[this.props.templateKey] ?
        this.props.templatesConfig.compileOptions :
        {},
      helpers: this.props.templatesConfig.helpers,
      data: this.props.transformData ?
        getTransformData(this.props.transformData, this.props.templateKey)(this.props.data) :
        this.props.data
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
  templates: React.PropTypes.objectOf(React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ])),
  templateKey: React.PropTypes.string,
  useCustomCompileOptions: React.PropTypes.objectOf(React.PropTypes.bool),
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
  data: React.PropTypes.object
};

Template.defaultProps = {
  data: {}
};

function getTransformData(transformData, templateKey) {
  if (typeof transformData === 'function') {
    return transformData;
  } else if (typeof transformData[templateKey] === 'function') {
    return transformData[templateKey];
  }

  throw new Error('transformData should be a function or an object');
}

module.exports = Template;
