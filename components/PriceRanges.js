var React = require('react');

var Template = require('./Template');
var cx = require('classnames');

class PriceRange extends React.Component {
  refine(from, to, event) {
    event.preventDefault();
    this.refs.from.value = this.refs.to.value = '';
    this.props.refine(from, to);
  }

  _handleSubmit(e) {
    this.refine(+this.refs.from.value || undefined, +this.refs.to.value || undefined, e);
  }

  render() {
    return (
      <div>
        {this.props.facetValues.map(facetValue => {
          var key = facetValue.from + '_' + facetValue.to;
          return (
            <a
              className={cx(this.props.cssClasses.range, {active: facetValue.isRefined})}
              href="#"
              key={key}
              onClick={this.refine.bind(this, facetValue.from, facetValue.to)}
            >
              <Template data={facetValue} templateKey="range" {...this.props.templateProps} />
            </a>
          );
        })}
        <form
          className={this.props.cssClasses.form}
          onSubmit={this._handleSubmit.bind(this)}
          ref="form"
        >
          <label>
            {this.props.labels.currency}{' '}
            <input className={this.props.cssClasses.input} ref="from" type="number" />
          </label>
          {' '}{this.props.labels.to}{' '}
          <label>
            {this.props.labels.currency}{' '}
            <input className={this.props.cssClasses.input} ref="to" type="number" />
          </label>
          {' '}
          <button
            className={this.props.cssClasses.button}
            type="submit"
          >{this.props.labels.button}</button>
        </form>
      </div>
    );
  }
}

PriceRange.propTypes = {
  cssClasses: React.PropTypes.shape({
    range: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    input: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    button: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
  facetValues: React.PropTypes.array,
  labels: React.PropTypes.shape({
    button: React.PropTypes.string,
    currency: React.PropTypes.string,
    to: React.PropTypes.string
  }),
  refine: React.PropTypes.func.isRequired,
  templateProps: React.PropTypes.object.isRequired
};

module.exports = PriceRange;
