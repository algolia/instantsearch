import { isEqual } from 'lodash';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { LatLngPropType, BoundingBoxPropType } from './propTypes';

export const STATE_CONTEXT = '__ais_geo_search__state__';

class Provider extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    hits: PropTypes.arrayOf(PropTypes.object).isRequired,
    isRefineOnMapMove: PropTypes.bool.isRequired,
    hasMapMoveSinceLastRefine: PropTypes.bool.isRequired,
    isRefineEnable: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    toggleRefineOnMapMove: PropTypes.func.isRequired,
    setMapMoveSinceLastRefine: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    position: LatLngPropType,
    currentRefinement: BoundingBoxPropType,
  };

  static childContextTypes = {
    [STATE_CONTEXT]: PropTypes.shape({
      isRefineOnMapMove: PropTypes.bool.isRequired,
      hasMapMoveSinceLastRefine: PropTypes.bool.isRequired,
      toggleRefineOnMapMove: PropTypes.func.isRequired,
      setMapMoveSinceLastRefine: PropTypes.func.isRequired,
      refineWithInstance: PropTypes.func.isRequired,
    }).isRequired,
  };

  isPendingRefine = false;
  boundingBox = null;
  previousBoundingBox = null;

  getChildContext() {
    const {
      isRefineOnMapMove,
      hasMapMoveSinceLastRefine,
      toggleRefineOnMapMove,
      setMapMoveSinceLastRefine,
    } = this.props;

    return {
      [STATE_CONTEXT]: {
        refineWithInstance: this.refineWithInstance,
        toggleRefineOnMapMove,
        setMapMoveSinceLastRefine,
        isRefineOnMapMove,
        hasMapMoveSinceLastRefine,
      },
    };
  }

  componentDidUpdate(prevProps) {
    const {
      position: previousPosition,
      currentRefinement: previousCurrentRefinement,
    } = prevProps;

    const {
      position,
      currentRefinement,
      setMapMoveSinceLastRefine,
    } = this.props;

    const positionChanged = !isEqual(previousPosition, position);
    const currentRefinementChanged = !isEqual(
      previousCurrentRefinement,
      currentRefinement
    );

    if (positionChanged || currentRefinementChanged) {
      setMapMoveSinceLastRefine(false);
    }

    this.previousBoundingBox = this.boundingBox;
  }

  createBoundingBoxFromHits(hits) {
    const { google } = this.props;

    const latLngBounds = hits.reduce(
      (acc, hit) => acc.extend(hit._geoloc),
      new google.maps.LatLngBounds()
    );

    return {
      northEast: latLngBounds.getNorthEast().toJSON(),
      southWest: latLngBounds.getSouthWest().toJSON(),
    };
  }

  refineWithInstance = instance => {
    const { refine } = this.props;

    const bounds = instance.getBounds();

    refine({
      northEast: bounds.getNorthEast().toJSON(),
      southWest: bounds.getSouthWest().toJSON(),
    });
  };

  onChange = () => {
    const {
      isRefineOnMapMove,
      isRefineEnable,
      setMapMoveSinceLastRefine,
    } = this.props;

    if (isRefineEnable) {
      setMapMoveSinceLastRefine(true);

      if (isRefineOnMapMove) {
        this.isPendingRefine = true;
      }
    }
  };

  onIdle = ({ instance }) => {
    if (this.isPendingRefine) {
      this.isPendingRefine = false;

      this.refineWithInstance(instance);
    }
  };

  shouldUpdate = () => {
    const { hasMapMoveSinceLastRefine } = this.props;

    return (
      !this.isPendingRefine &&
      !hasMapMoveSinceLastRefine &&
      !isEqual(this.boundingBox, this.previousBoundingBox)
    );
  };

  render() {
    const { hits, currentRefinement, children } = this.props;

    // We use this value for differentiate the padding to apply during
    // fitBounds. When we don't have a currenRefinement (boundingBox)
    // we let GoogleMaps compute the automatic padding. But when we
    // provide the currentRefinement we explicitly set the padding
    // to `0` otherwise the map will decrease the zoom on each refine.
    const boundingBoxPadding = !currentRefinement ? undefined : 0;
    const boundingBox =
      !currentRefinement && Boolean(hits.length)
        ? this.createBoundingBoxFromHits(hits)
        : currentRefinement;

    this.boundingBox = boundingBox;

    return children({
      onChange: this.onChange,
      onIdle: this.onIdle,
      shouldUpdate: this.shouldUpdate,
      boundingBox,
      boundingBoxPadding,
    });
  }
}

export default Provider;
