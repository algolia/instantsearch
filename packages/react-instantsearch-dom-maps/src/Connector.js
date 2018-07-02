import { isEqual } from 'lodash';
import { Component } from 'react';
import { polyfill } from 'react-lifecycles-compat';
import PropTypes from 'prop-types';
import { connectGeoSearch } from 'react-instantsearch-dom';
import { LatLngPropType, BoundingBoxPropType } from './propTypes';

export const STATE_CONTEXT = '__ais_geo_search__state__';

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

    const positionChanged = !isEqual(previousPosition, position);
    const currentRefinementChanged = !isEqual(
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

  setMapMoveSinceLastRefine = next => {
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
      hasMapMoveSinceLastRefine,
      position,
      currentRefinement,
      refine,
    });
  }
}

polyfill(Connector);

export default connectGeoSearch(Connector);
