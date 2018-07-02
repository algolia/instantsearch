import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createClassNames, translatable } from 'react-instantsearch-dom';
import { STATE_CONTEXT } from './Provider';
import { GOOGLE_MAPS_CONTEXT } from './GoogleMaps';

const cx = createClassNames('GeoSearch');

export class Redo extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
  };

  static contextTypes = {
    [STATE_CONTEXT]: PropTypes.shape({
      hasMapMoveSinceLastRefine: PropTypes.bool.isRequired,
      refineWithInstance: PropTypes.func.isRequired,
    }).isRequired,
    [GOOGLE_MAPS_CONTEXT]: PropTypes.shape({
      instance: PropTypes.object.isRequired,
    }).isRequired,
  };

  getStateContext() {
    return this.context[STATE_CONTEXT];
  }

  getGoogleMapsContext() {
    return this.context[GOOGLE_MAPS_CONTEXT];
  }

  render() {
    const { translate } = this.props;
    const { instance } = this.getGoogleMapsContext();
    const {
      hasMapMoveSinceLastRefine,
      refineWithInstance,
    } = this.getStateContext();

    return (
      <div className={cx('control')}>
        <button
          className={cx('redo', !hasMapMoveSinceLastRefine && 'redo--disabled')}
          disabled={!hasMapMoveSinceLastRefine}
          onClick={() => refineWithInstance(instance)}
        >
          {translate('redo')}
        </button>
      </div>
    );
  }
}

export default translatable({
  redo: 'Redo search here',
})(Redo);
