import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InstantSearch } from 'react-instantsearch/native';
import {
  connectRefinementList,
  connectSearchBox,
  connectRange,
  connectMenu,
} from 'react-instantsearch/connectors';
import Stats from './components/Stats';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flexGrow: 1,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

class Filters extends Component {
  static displayName = 'React Native example';
  constructor(props) {
    super(props);
    this.onSearchStateChange = this.onSearchStateChange.bind(this);
    this.state = {
      searchState: props.searchState,
    };
  }
  onSearchStateChange(nextState) {
    const searchState = { ...this.state.searchState, ...nextState };
    this.setState({ searchState });
    this.props.onSearchStateChange(searchState);
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <InstantSearch
          appId="latency"
          apiKey="6be0576ff61c053d5f9a3225e2a90f76"
          indexName="instant_search"
          onSearchStateChange={this.onSearchStateChange}
          searchState={this.state.searchState}
        >
          <View style={{ marginTop: 50 }}>
            <ConnectedRange attribute="price" />
          </View>
          <Stats
            searchState={this.state.searchState}
            onSearchStateChange={this.onSearchStateChange}
          />
          <VirtualRefinementList attribute="type" />
          <VirtualMenu attribute="categories" />
          <VirtualSearchBox />
        </InstantSearch>
      </View>
    );
  }
}

Filters.propTypes = {
  searchState: PropTypes.object.isRequired,
  onSearchStateChange: PropTypes.func.isRequired,
};

export default Filters;

class Range extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValues: {
        min: this.props.min,
        max: this.props.max,
      },
    };
  }
  componentWillReceiveProps(sliderState) {
    if (sliderState.canRefine) {
      this.setState({
        currentValues: {
          min: sliderState.currentRefinement.min,
          max: sliderState.currentRefinement.max,
        },
      });
    }
  }

  sliderOneValuesChange = sliderState => {
    this.setState({
      currentValues: { min: sliderState[0], max: sliderState[1] },
    });
  };

  sliderOneValuesChangeFinish = sliderState => {
    if (
      this.props.currentRefinement.min !== sliderState[0] ||
      this.props.currentRefinement.max !== sliderState[1]
    ) {
      this.props.refine({
        min: sliderState[0],
        max: sliderState[1],
      });
    }
  };

  render() {
    const slider =
      this.props.min !== this.props.max ? (
        <MultiSlider
          values={[
            Math.trunc(this.state.currentValues.min),
            Math.trunc(this.state.currentValues.max),
          ]}
          min={Math.trunc(this.props.min)}
          max={Math.trunc(this.props.max)}
          onValuesChange={this.sliderOneValuesChange}
          onValuesChangeFinish={this.sliderOneValuesChangeFinish}
        />
      ) : null;
    const content =
      this.props.min !== this.props.max ? (
        <View style={styles.container}>
          <Text style={{ marginTop: 5 }}>
            $ {Math.trunc(this.state.currentValues.min)}
          </Text>
          {slider}
          <Text style={{ marginTop: 5 }}>
            $ {Math.trunc(this.state.currentValues.max)}
          </Text>
        </View>
      ) : (
        <Text>
          {this.props.min
            ? `$ ${Math.trunc(this.state.currentValues.min)}`
            : null}
        </Text>
      );
    return <View style={styles.container}>{content}</View>;
  }
}

Range.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  currentRefinement: PropTypes.object,
  refine: PropTypes.func.isRequired,
};

const VirtualRefinementList = connectRefinementList(() => null);
const VirtualSearchBox = connectSearchBox(() => null);
const VirtualMenu = connectMenu(() => null);
const ConnectedRange = connectRange(Range);
