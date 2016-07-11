import React from 'react';

class PriceRangesForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.currentRefinement.from,
      to: props.currentRefinement.to
    };
  }

  componentWillMount() {
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      from: props.currentRefinement.from,
      to: props.currentRefinement.to
    });
  }

  getInput(type) {
    return (
      <label className={this.props.cssClasses.label}>
        <span className={this.props.cssClasses.currency}>{this.props.labels.currency} </span>
        <input
          className={this.props.cssClasses.input}
          onChange={e => this.setState({[type]: e.target.value})}
          ref={type}
          type="number"
          value={this.state[type]}
        />
      </label>
    );
  }

  handleSubmit(event) {
    const from = this.refs.from.value !== '' ?
      parseInt(this.refs.from.value, 10) : undefined;
    const to = this.refs.to.value !== '' ?
      parseInt(this.refs.to.value, 10) : undefined;
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
  currentRefinement: React.PropTypes.shape({
    from: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
    to: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
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
