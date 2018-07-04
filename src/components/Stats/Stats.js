import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import isEqual from 'lodash/isEqual';

import Template from '../Template';

export default class Stats extends Component {
  shouldComponentUpdate(nextProps) {
    return isEqual(this.props.data, nextProps.data);
  }

  render() {
    const { cssClasses, data } = this.props;

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
  data: PropTypes.shape({
    hasManyResults: PropTypes.bool,
    hasNoResults: PropTypes.bool,
    hasOneResult: PropTypes.bool,
    hitsPerPage: PropTypes.number,
    nbHits: PropTypes.number,
    nbPages: PropTypes.number,
    page: PropTypes.number,
    processingTimeMS: PropTypes.number,
    query: PropTypes.string,
  }),
  templateProps: PropTypes.object.isRequired,
};
