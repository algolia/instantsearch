import React from 'react';

class PriceRangesForm extends React.Component {
  componentWillMount() {
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  getInput(type) {
    return (
      <label className={this.props.cssClasses.label}>
        <span className={this.props.cssClasses.currency}>{this.props.labels.currency} </span>
        <input className={this.props.cssClasses.input} ref={type} type="number" />
      </label>
    );
  }

  handleSubmit(event) {
    let from = +this.refs.from.value || undefined;
    let to = +this.refs.to.value || undefined;
    this.props.refine(from, to, event);
  }

  render() {
    let fromInput = this.getInput('from');
    let toInput = this.getInput('to');
    let onSubmit = this.handleSubmit;
    return (
      <form className={this.props.cssClasses.form} onSubmit={onSubmit} ref="form">
        {fromInput}
        <span className={this.props.cssClasses.separator}> {this.props.labels.separator} </span>
        {toInput}
        <button className={this.props.cssClasses.button} type="submit">{this.props.labels.button}</button>
      </form>
    );
  }
}

PriceRangesForm.propTypes = {
  cssClasses: React.PropTypes.shape({
    button: React.PropTypes.string,
    currency: React.PropTypes.string,
    form: React.PropTypes.string,
    input: React.PropTypes.string,
    label: React.PropTypes.string,
    separator: React.PropTypes.string
  }),
  labels: React.PropTypes.shape({
    button: React.PropTypes.string,
    currency: React.PropTypes.string,
    separator: React.PropTypes.string
  }),
  refine: React.PropTypes.func.isRequired
};


PriceRangesForm.defaultProps = {
  cssClasses: {},
  labels: {}
};


export default PriceRangesForm;

