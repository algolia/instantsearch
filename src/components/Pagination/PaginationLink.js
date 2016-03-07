import React from 'react';

import isEqual from 'lodash/lang/isEqual';

class PaginationLink extends React.Component {
  componentWillMount() {
    this.handleClick = this.handleClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  handleClick(e) {
    this.props.handleClick(this.props.pageNumber, e);
  }

  render() {
    let {cssClasses, label, ariaLabel, url} = this.props;

    return (
      <li className={cssClasses.item}>
        <a
          ariaLabel={ariaLabel}
          className={cssClasses.link}
          dangerouslySetInnerHTML={{__html: label}}
          href={url}
          onClick={this.handleClick}
        ></a>
      </li>
    );
  }
}

PaginationLink.propTypes = {
  ariaLabel: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  cssClasses: React.PropTypes.shape({
    item: React.PropTypes.string,
    link: React.PropTypes.string
  }),
  handleClick: React.PropTypes.func.isRequired,
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired,
  pageNumber: React.PropTypes.number,
  url: React.PropTypes.string
};

export default PaginationLink;
