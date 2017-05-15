import times from 'lodash/times';
import range from 'lodash/range';
import has from 'lodash/has';

import React, {Component, PropTypes} from 'react';
import Rheostat from 'rheostat';
import cx from 'classnames';

import Pit from './Pit.js';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

class Slider extends Component {

  static propTypes = {
    refine: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    values: PropTypes.arrayOf(PropTypes.number).isRequired,
    pips: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.object,
    ]),
    step: PropTypes.number.isRequired,
    tooltips: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({format: PropTypes.func.isRequired}),
    ]),
  }

  handleChange = ({values}) => {
    const {refine} = this.props;
    refine(values);
  }

  // creates an array number where to display a pit point on the slider
  computeDefaultPitPoints({min, max}) {
    const totalLenght = max - min;
    const steps = 34;
    const stepsLength = totalLenght / steps;

    const pitPoints = [min, ...times(steps - 1, step => min + stepsLength * (step + 1)), max]
      // bug with `key={ 0 }` and preact, see https://github.com/developit/preact/issues/642
      .map(pitPoint => pitPoint === 0 ? 0.00001 : pitPoint);

    return pitPoints;
  }

  // creates an array of values where the slider should snap to
  computeSnapPoints({min, max, step}) {
    return range(min, max + step, step);
  }

  createHandleComponent = tooltips => props => {
    const value = has(tooltips, 'format')
      ? tooltips.format(props['aria-valuenow'])
      : props['aria-valuenow'];

    return (
      <div
        {...props}
        className={ cx('ais-range-slider--handle', props.className)}
      >
        { tooltips
            ? <div className="ais-range-slider--tooltip">{value}</div>
            : null }
      </div>
    );
  }

  render() {
    const {tooltips, step, pips, values, min, max} = this.props;

    const snapPoints = this.computeSnapPoints({min, max, step});
    const pitPoints = pips === true || pips === undefined || pips === false
      ? this.computeDefaultPitPoints({min, max})
      : pips;

    return (
      <Rheostat
        handle={ this.createHandleComponent(tooltips) }
        onChange={ this.handleChange }
        min={ min }
        max={ max }
        pitComponent={ Pit }
        pitPoints={ pitPoints }
        snap={ true }
        snapPoints={ snapPoints }
        values={ values }
        disabled={ true }
      />
    );
  }

}

export default autoHideContainerHOC(headerFooterHOC(Slider));
