import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createClassNames, translatable } from 'react-instantsearch-dom';
import { STATE_CONTEXT } from './Provider';
import { GOOGLE_MAPS_CONTEXT } from './GoogleMaps';

const cx = createClassNames('GeoSearch');

export class Control extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    enableRefineOnMapMove: PropTypes.bool,
  };

  static contextTypes = {
    [STATE_CONTEXT]: PropTypes.shape({
      isRefineOnMapMove: PropTypes.bool.isRequired,
      toggleRefineOnMapMove: PropTypes.func.isRequired,
      hasMapMoveSinceLastRefine: PropTypes.bool.isRequired,
      refineWithInstance: PropTypes.func.isRequired,
    }).isRequired,
    [GOOGLE_MAPS_CONTEXT]: PropTypes.shape({
      instance: PropTypes.object.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    enableRefineOnMapMove: true,
  };

  getStateContext() {
    return this.context[STATE_CONTEXT];
  }

  getGoogleMapsContext() {
    return this.context[GOOGLE_MAPS_CONTEXT];
  }

  componentDidMount() {
    const { enableRefineOnMapMove } = this.props;
    const { isRefineOnMapMove, toggleRefineOnMapMove } = this.getStateContext();

    if (!enableRefineOnMapMove && isRefineOnMapMove) {
      toggleRefineOnMapMove();
    }
  }

  render() {
    const { translate } = this.props;
    const { instance } = this.getGoogleMapsContext();
    const {
      isRefineOnMapMove,
      hasMapMoveSinceLastRefine,
      toggleRefineOnMapMove,
      refineWithInstance,
    } = this.getStateContext();

    return (
      <div className={cx('control')}>
        {isRefineOnMapMove || !hasMapMoveSinceLastRefine ? (
          <label className={cx('label')}>
            <input
              className={cx('input')}
              type="checkbox"
              checked={isRefineOnMapMove}
              onChange={toggleRefineOnMapMove}
            />
            {translate('control')}
          </label>
        ) : (
          <button
            className={cx('redo')}
            onClick={() => refineWithInstance(instance)}
          >
            {translate('redo')}
          </button>
        )}
      </div>
    );
  }
}

export default translatable({
  control: 'Search as I move the map',
  redo: 'Redo search here',
})(Control);
