import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createClassNames, translatable } from 'react-instantsearch-dom';
import { STATE_CONTEXT } from './Provider';
import withGoogleMaps from './withGoogleMaps';

const cx = createClassNames('GeoSearch');

export class Redo extends Component {
  static propTypes = {
    googleMapsInstance: PropTypes.object.isRequired,
    translate: PropTypes.func.isRequired,
  };

  static contextTypes = {
    [STATE_CONTEXT]: PropTypes.shape({
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
      hasMapMoveSinceLastRefine,
      refineWithInstance,
    } = this.getStateContext();

    return (
      <div className={cx('control')}>
        <button
          className={cx('redo', !hasMapMoveSinceLastRefine && 'redo--disabled')}
          disabled={!hasMapMoveSinceLastRefine}
          onClick={() => refineWithInstance(googleMapsInstance)}
        >
          {translate('redo')}
        </button>
      </div>
    );
  }
}

export default translatable({
  redo: 'Redo search here',
})(withGoogleMaps(Redo));
