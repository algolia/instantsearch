import React from 'react';

class PoweredBy extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className={this.props.cssClasses.root}>
        Search by
        <a className={this.props.cssClasses.link} href={this.props.link} target="_blank">Algolia</a>
      </div>
    );
  }
}

PoweredBy.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    link: React.PropTypes.string
  }),
  link: React.PropTypes.string.isRequired
};

export default PoweredBy;
