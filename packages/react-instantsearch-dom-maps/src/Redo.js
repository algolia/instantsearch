import PropTypes from 'prop-types';
import React from 'react';
import { createClassNames, translatable } from 'react-instantsearch-dom';

import GeoSearchContext from './GeoSearchContext';
import withGoogleMaps from './withGoogleMaps';

const cx = createClassNames('GeoSearch');
const RedoPropTypes = {
  googleMapsInstance: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
};

export const Redo = ({
  googleMapsInstance,
  translate,
  hasMapMoveSinceLastRefine,
  refineWithInstance,
}) => (
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

Redo.propTypes = {
  ...RedoPropTypes,
  hasMapMoveSinceLastRefine: PropTypes.bool.isRequired,
  refineWithInstance: PropTypes.func.isRequired,
};

const RedoWrapper = (props) => (
  <GeoSearchContext.Consumer>
    {({ hasMapMoveSinceLastRefine, refineWithInstance }) => (
      <Redo
        {...props}
        hasMapMoveSinceLastRefine={hasMapMoveSinceLastRefine}
        refineWithInstance={refineWithInstance}
      />
    )}
  </GeoSearchContext.Consumer>
);

RedoWrapper.propTypes = RedoPropTypes;

export default translatable({
  redo: 'Redo search here',
})(withGoogleMaps(RedoWrapper));
