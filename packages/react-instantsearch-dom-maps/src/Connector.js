import PropTypes from 'prop-types';
import { Component } from 'react';
import { connectGeoSearch } from 'react-instantsearch-dom';

import { LatLngPropType, BoundingBoxPropType } from './propTypes';

function isEqualPosition(a, b) {
  if (a === b) {
    return true;
  }
  if (a === undefined || b === undefined) {
    return false;
  }

  return a.lat === b.lat && a.lng === b.lng;
}

function isEqualCurrentRefinement(a, b) {
  if (a === b) {
    return true;
  }

  if (a === undefined || b === undefined) {
    return false;
  }

  return (
    isEqualPosition(a.northEast, b.northEast) &&
    isEqualPosition(a.southWest, b.southWest)
  );
}

export class Connector extends Component {
  static propTypes = {
    hits: PropTypes.arrayOf(PropTypes.object).isRequired,
    isRefinedWithMap: PropTypes.bool.isRequired,
    enableRefineOnMapMove: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    position: LatLngPropType,
    currentRefinement: BoundingBoxPropType,
  };

  static getDerivedStateFromProps(props, state) {
    const { position, currentRefinement } = props;
    const { previousPosition, previousCurrentRefinement } = state;

    const positionChanged = !isEqualPosition(previousPosition, position);
    const currentRefinementChanged = !isEqualCurrentRefinement(
      previousCurrentRefinement,
      currentRefinement
    );

    const sliceNextState = {
      previousPosition: position,
      previousCurrentRefinement: currentRefinement,
    };

    if (positionChanged || currentRefinementChanged) {
      return {
        ...sliceNextState,
        hasMapMoveSinceLastRefine: false,
      };
    }

    return sliceNextState;
  }

  state = {
    isRefineOnMapMove: this.props.enableRefineOnMapMove,
    hasMapMoveSinceLastRefine: false,
    previousPosition: this.props.position,
    previousCurrentRefinement: this.props.currentRefinement,
  };

  toggleRefineOnMapMove = () =>
    this.setState(({ isRefineOnMapMove }) => ({
      isRefineOnMapMove: !isRefineOnMapMove,
    }));

  setMapMoveSinceLastRefine = (next) => {
    const { hasMapMoveSinceLastRefine } = this.state;

    if (hasMapMoveSinceLastRefine === next) {
      return;
    }

    this.setState(() => ({
      hasMapMoveSinceLastRefine: next,
    }));
  };

  render() {
    const {
      hits,
      isRefinedWithMap,
      position,
      currentRefinement,
      refine,
      children,
    } = this.props;

    const { isRefineOnMapMove, hasMapMoveSinceLastRefine } = this.state;

    return children({
      toggleRefineOnMapMove: this.toggleRefineOnMapMove,
      setMapMoveSinceLastRefine: this.setMapMoveSinceLastRefine,
      hits,
      isRefinedWithMap,
      isRefineOnMapMove,
      // @MAJOR hasMapMoveSinceLastRefine -> hasMapMovedSinceLastRefine
      hasMapMoveSinceLastRefine,
      position,
      currentRefinement,
      refine,
    });
  }
}

export default connectGeoSearch(Connector, { $$widgetType: 'ais.geoSearch' });
