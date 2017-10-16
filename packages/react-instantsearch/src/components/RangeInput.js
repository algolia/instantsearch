import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isNaN } from 'lodash';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('RangeInput');

export class RawRangeInput extends Component {
  static propTypes = {
    canRefine: PropTypes.bool.isRequired,
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
  };

  static defaultProps = {
    currentRefinement: {},
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      from: this.props.canRefine ? props.currentRefinement.min : '',
      to: this.props.canRefine ? props.currentRefinement.max : '',
    };
  }

  componentWillMount() {
    if (this.context.canRefine) {
      this.context.canRefine(this.props.canRefine);
    }
  }

  componentWillReceiveProps(nextProps) {
    // In react@16.0.0 the call to setState on the inputs trigger this lifecycle hook
    // because the context has changed (for react). I don't think that the bug is related
    // to react because I failed to reproduce it with a simple hierarchy of components.
    // The workaround here is to check the differences between previous & next props in order
    // to avoid to override current state when values are not yet refined. In the react documentation,
    // they DON'T categorically say that setState never run componentWillReceiveProps.
    // see: https://reactjs.org/docs/react-component.html#componentwillreceiveprops

    if (
      nextProps.canRefine &&
      (this.props.canRefine !== nextProps.canRefine ||
        this.props.currentRefinement.min !== nextProps.currentRefinement.min ||
        this.props.currentRefinement.max !== nextProps.currentRefinement.max)
    ) {
      this.setState({
        from: nextProps.currentRefinement.min,
        to: nextProps.currentRefinement.max,
      });
    }

    if (
      this.context.canRefine &&
      this.props.canRefine !== nextProps.canRefine
    ) {
      this.context.canRefine(nextProps.canRefine);
    }
  }

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !isNaN(parseFloat(this.state.from, 10)) &&
      !isNaN(parseFloat(this.state.to, 10))
    ) {
      this.props.refine({ min: this.state.from, max: this.state.to });
    }
  };

  render() {
    const { translate, canRefine } = this.props;
    return (
      <form
        {...cx('root', !canRefine && 'noRefinement')}
        onSubmit={this.onSubmit}
      >
        <fieldset disabled={!canRefine} {...cx('fieldset')}>
          <label {...cx('labelMin')}>
            <input
              {...cx('inputMin')}
              type="number"
              value={this.state.from}
              onChange={e => this.setState({ from: e.target.value })}
            />
          </label>
          <span {...cx('separator')}>{translate('separator')}</span>
          <label {...cx('labelMax')}>
            <input
              {...cx('inputMax')}
              type="number"
              value={this.state.to}
              onChange={e => this.setState({ to: e.target.value })}
            />
          </label>
          <button {...cx('submit')} type="submit">
            {translate('submit')}
          </button>
        </fieldset>
      </form>
    );
  }
}

export default translatable({
  submit: 'ok',
  separator: 'to',
})(RawRangeInput);
