import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createClassNames, translatable } from 'react-instantsearch-dom';
import { STATE_CONTEXT } from './Provider';
import withGoogleMaps from './withGoogleMaps';

const cx = createClassNames('GeoSearch');

export class Control extends Component {
  static propTypes = {
    googleMapsInstance: PropTypes.object.isRequired,
    translate: PropTypes.func.isRequired,
  };

  static contextTypes = {
    [STATE_CONTEXT]: PropTypes.shape({
      isRefineOnMapMove: PropTypes.bool.isRequired,
      toggleRefineOnMapMove: PropTypes.func.isRequired,
      hasMapMoveSinceLastRefine: PropTypes.bool.isRequired,
      refineWithInstance: PropTypes.func.isRequired,
    }).isRequired,
  };

  getStateContext() {
    return this.context[STATE_CONTEXT];
  }

  render() {
    const { googleMapsInstance, translate } = this.props;
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
            onClick={() => refineWithInstance(googleMapsInstance)}
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
})(withGoogleMaps(Control));
