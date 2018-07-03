import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';

import Template from '../Template';

export default class Stats extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      this.props.nbHits !== nextProps.nbHits ||
      this.props.processingTimeMS !== nextProps.processingTimeMS
    );
  }

  render() {
    const { cssClasses } = this.props;
    const data = {
      hasManyResults: this.props.nbHits > 1,
      hasNoResults: this.props.nbHits === 0,
      hasOneResult: this.props.nbHits === 1,
      hitsPerPage: this.props.hitsPerPage,
      nbHits: this.props.nbHits,
      nbPages: this.props.nbPages,
      page: this.props.page,
      processingTimeMS: this.props.processingTimeMS,
      query: this.props.query,
    };

    return (
      <div className={cssClasses.root}>
        <Template
          data={data}
          templateKey="text"
          rootProps={{
            className: cssClasses.text,
          }}
          rootTagName="span"
          {...this.props.templateProps}
        />
      </div>
    );
  }
}

Stats.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string,
    text: PropTypes.string,
  }),
  hitsPerPage: PropTypes.number,
  nbHits: PropTypes.number,
  nbPages: PropTypes.number,
  page: PropTypes.number,
  processingTimeMS: PropTypes.number,
  query: PropTypes.string,
  templateProps: PropTypes.object.isRequired,
};
