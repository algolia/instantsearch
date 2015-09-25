var React = require('react');

var Template = require('./Template');

class Stats extends React.Component {
  render() {
    var template = this.props.template;
    var defaultTemplate = this.props.defaultTemplate;
    var templatesConfig = this.props.templatesConfig;
    var transformData = this.props.transformData;
    var data = {
      hasManyResults: this.props.nbHits > 1,
      hasNoResults: this.props.nbHits === 0,
      hasOneResult: this.props.nbHits === 1,
      hitsPerPage: this.props.hitsPerPage,
      nbHits: this.props.nbHits,
      nbPages: this.props.nbPages,
      page: this.props.page,
      processingTimeMS: this.props.processingTimeMS,
      query: this.props.query
    };

    return (
      <Template
        data={data}
        transformData={transformData}
        template={template}
        defaultTemplate={defaultTemplate}
        config={templatesConfig}
      />
    );
  }
}

Stats.propTypes = {
  hitsPerPage: React.PropTypes.number,
  nbHits: React.PropTypes.number,
  nbPages: React.PropTypes.number,
  page: React.PropTypes.number,
  processingTimeMS: React.PropTypes.number,
  template: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.string
  ]),
  defaultTemplate: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.string
  ]).isRequired,
  transformData: React.PropTypes.func,
  templatesConfig: React.PropTypes.object.isRequired,
  query: React.PropTypes.string
};

module.exports = Stats;
