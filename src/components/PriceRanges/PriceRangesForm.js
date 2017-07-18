import PropTypes from 'prop-types';
import React from 'react';

class PriceRangesForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.currentRefinement.from,
      to: props.currentRefinement.to,
    };
  }

  componentWillMount() {
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      from: props.currentRefinement.from,
      to: props.currentRefinement.to,
    });
  }

  getInput(type) {
    return (
      <label className={this.props.cssClasses.label}>
        <span className={this.props.cssClasses.currency}>
          {this.props.labels.currency}{' '}
        </span>
        <input
          className={this.props.cssClasses.input}
          onChange={e => this.setState({ [type]: e.target.value })}
          ref={type}
          type="number"
          value={this.state[type]}
        />
      </label>
    );
  }

  handleSubmit(event) {
    const from =
      this.refs.from.value !== ''
        ? parseInt(this.refs.from.value, 10)
        : undefined;
    const to =
      this.refs.to.value !== '' ? parseInt(this.refs.to.value, 10) : undefined;
    this.props.refine(from, to, event);
  }

  render() {
    const fromInput = this.getInput('from');
    const toInput = this.getInput('to');
    const onSubmit = this.handleSubmit;
    return (
      <form
        className={this.props.cssClasses.form}
        onSubmit={onSubmit}
        ref="form"
      >
        {fromInput}
        <span className={this.props.cssClasses.separator}>
          {' '}{this.props.labels.separator}{' '}
        </span>
        {toInput}
        <button className={this.props.cssClasses.button} type="submit">
          {this.props.labels.button}
        </button>
      </form>
    );
  }
}

PriceRangesForm.propTypes = {
  cssClasses: PropTypes.shape({
    button: PropTypes.string,
    currency: PropTypes.string,
    form: PropTypes.string,
    input: PropTypes.string,
    label: PropTypes.string,
    separator: PropTypes.string,
  }),
  currentRefinement: PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  labels: PropTypes.shape({
    button: PropTypes.string,
    currency: PropTypes.string,
    separator: PropTypes.string,
  }),
  refine: PropTypes.func.isRequired,
};

PriceRangesForm.defaultProps = {
  cssClasses: {},
  labels: {},
};

export default PriceRangesForm;
