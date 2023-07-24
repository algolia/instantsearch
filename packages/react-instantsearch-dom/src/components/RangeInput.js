import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';

const cx = createClassNames('RangeInput');

export class RawRangeInput extends Component {
  static propTypes = {
    canRefine: PropTypes.bool.isRequired,
    precision: PropTypes.number.isRequired,
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    className: PropTypes.string,
  };

  static defaultProps = {
    currentRefinement: {},
    className: '',
  };

  constructor(props) {
    super(props);

    this.state = this.normalizeStateForRendering(props);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.canRefine &&
      (prevProps.currentRefinement.min !== this.props.currentRefinement.min ||
        prevProps.currentRefinement.max !== this.props.currentRefinement.max)
    ) {
      this.setState(this.normalizeStateForRendering(this.props));
    }
  }

  onSubmit = (e) => {
    e.preventDefault();

    this.props.refine({
      min: this.state.from,
      max: this.state.to,
    });
  };

  normalizeStateForRendering(props) {
    const { canRefine, min: rangeMin, max: rangeMax } = props;
    const { min: valueMin, max: valueMax } = props.currentRefinement;

    return {
      from:
        canRefine && valueMin !== undefined && valueMin !== rangeMin
          ? valueMin
          : '',
      to:
        canRefine && valueMax !== undefined && valueMax !== rangeMax
          ? valueMax
          : '',
    };
  }

  normalizeRangeForRendering({ canRefine, min, max }) {
    const hasMin = min !== undefined;
    const hasMax = max !== undefined;

    return {
      min: canRefine && hasMin && hasMax ? min : '',
      max: canRefine && hasMin && hasMax ? max : '',
    };
  }

  render() {
    const { from, to } = this.state;
    const { precision, translate, canRefine, className } = this.props;
    const { min, max } = this.normalizeRangeForRendering(this.props);
    const step = 1 / Math.pow(10, precision);

    return (
      <div
        className={classNames(cx('', !canRefine && '-noRefinement'), className)}
      >
        <form className={cx('form')} onSubmit={this.onSubmit}>
          <input
            className={cx('input', 'input--min')}
            type="number"
            min={min}
            max={max}
            value={from}
            step={step}
            placeholder={min}
            disabled={!canRefine}
            onChange={(e) => this.setState({ from: e.currentTarget.value })}
          />
          <span className={cx('separator')}>{translate('separator')}</span>
          <input
            className={cx('input', 'input--max')}
            type="number"
            min={min}
            max={max}
            value={to}
            step={step}
            placeholder={max}
            disabled={!canRefine}
            onChange={(e) => this.setState({ to: e.currentTarget.value })}
          />
          <button className={cx('submit')} type="submit">
            {translate('submit')}
          </button>
        </form>
      </div>
    );
  }
}

export default translatable({
  submit: 'ok',
  separator: 'to',
})(RawRangeInput);
