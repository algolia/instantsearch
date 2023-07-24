import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import { createFakeGoogleReference } from '../../test/mockGoogleMaps';
import GeoSearch from '../GeoSearch';

Enzyme.configure({ adapter: new Adapter() });

describe('GeoSearch', () => {
  const ShallowWapper = ({ children }) => children;

  const defaultProps = {
    google: createFakeGoogleReference(),
  };

  const defaultConnectorProps = {
    hits: [],
    isRefineOnMapMove: true,
    hasMapMoveSinceLastRefine: false,
    refine: () => {},
    toggleRefineOnMapMove: () => {},
    setMapMoveSinceLastRefine: () => {},
  };

  const renderConnector = ({ props, connectorProps, children = () => null }) =>
    shallow(<GeoSearch {...props}>{children}</GeoSearch>)
      .find('[testID="Connector"]')
      .props()
      .children(connectorProps);

  describe('Connector', () => {
    it('expect to render', () => {
      const props = {
        ...defaultProps,
      };

      const wrapper = shallow(<GeoSearch {...props}>{() => null}</GeoSearch>);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to render with enableRefineOnMapMove', () => {
      const props = {
        ...defaultProps,
        enableRefineOnMapMove: false,
      };

      const wrapper = shallow(<GeoSearch {...props}>{() => null}</GeoSearch>);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to render with defaultRefinement', () => {
      const props = {
        ...defaultProps,
        defaultRefinement: {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        },
      };

      const wrapper = shallow(<GeoSearch {...props}>{() => null}</GeoSearch>);

      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('Provider', () => {
    it('expect to render', () => {
      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const renderPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      expect(renderPropsWrapper).toMatchSnapshot();
    });

    it('expect to render with hits', () => {
      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
        hits: [
          { objectID: '0001' },
          { objectID: '0002' },
          { objectID: '0003' },
        ],
      };

      const renderPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerProps = renderPropsWrapper
        .find('[testID="Provider"]')
        .props();

      expect(providerProps.hits).toEqual([
        { objectID: '0001' },
        { objectID: '0002' },
        { objectID: '0003' },
      ]);
    });

    it('expect to render with position', () => {
      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
        position: {
          lat: 10,
          lng: 12,
        },
      };

      const renderConnectorWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerProps = renderConnectorWrapper
        .find('[testID="Provider"]')
        .props();

      expect(providerProps.position).toEqual({
        lat: 10,
        lng: 12,
      });
    });

    it('expect to render with currentRefinement', () => {
      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
        currentRefinement: {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        },
      };

      const renderConnectorWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerProps = renderConnectorWrapper
        .find('[testID="Provider"]')
        .props();

      expect(providerProps.currentRefinement).toEqual({
        northEast: {
          lat: 10,
          lng: 12,
        },
        southWest: {
          lat: 12,
          lng: 14,
        },
      });
    });

    it('expect to render with enableRefine', () => {
      const props = {
        ...defaultProps,
        enableRefine: false,
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const renderConnectorWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerProps = renderConnectorWrapper
        .find('[testID="Provider"]')
        .props();

      expect(providerProps.isRefineEnable).toBe(false);
    });
  });

  describe('GoogleMaps', () => {
    const defaultProviderProps = {
      onChange: () => {},
      onIdle: () => {},
      shouldUpdate: () => true,
    };

    const renderProvider = ({ connectorPropsWrapper, providerProps }) =>
      connectorPropsWrapper
        .find('[testID="Provider"]')
        .props()
        .children(providerProps);

    it('expect to render', () => {
      const children = jest.fn(() => <div>Hello this is the children</div>);

      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const providerProps = {
        ...defaultProviderProps,
      };

      const connectorPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps, children })}
        </ShallowWapper>
      );

      const providerPropsWrapper = shallow(
        <ShallowWapper>
          {renderProvider({ connectorPropsWrapper, providerProps })}
        </ShallowWapper>
      );

      expect(providerPropsWrapper).toMatchSnapshot();
      expect(children).toHaveBeenCalledWith({ hits: [] });
    });

    it('expect to render with initialZoom', () => {
      const props = {
        ...defaultProps,
        initialZoom: 8,
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const providerProps = {
        ...defaultProviderProps,
      };

      const connectorPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerPropsWrapper = shallow(
        <ShallowWapper>
          {renderProvider({ connectorPropsWrapper, providerProps })}
        </ShallowWapper>
      );

      const googleMapProps = providerPropsWrapper
        .find('[testID="GoogleMaps"]')
        .props();

      expect(googleMapProps.initialZoom).toBe(8);
    });

    it('expect to render with postiion', () => {
      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
        position: {
          lat: 10,
          lng: 12,
        },
      };

      const providerProps = {
        ...defaultProviderProps,
      };

      const connectorPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerPropsWrapper = shallow(
        <ShallowWapper>
          {renderProvider({ connectorPropsWrapper, providerProps })}
        </ShallowWapper>
      );

      const googleMapProps = providerPropsWrapper
        .find('[testID="GoogleMaps"]')
        .props();

      expect(googleMapProps.initialPosition).toEqual({
        lat: 10,
        lng: 12,
      });
    });

    it('expect to render with initialPosition', () => {
      const props = {
        ...defaultProps,
        initialPosition: {
          lat: 10,
          lng: 12,
        },
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const providerProps = {
        ...defaultProviderProps,
      };

      const connectorPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerPropsWrapper = shallow(
        <ShallowWapper>
          {renderProvider({ connectorPropsWrapper, providerProps })}
        </ShallowWapper>
      );

      const googleMapProps = providerPropsWrapper
        .find('[testID="GoogleMaps"]')
        .props();

      expect(googleMapProps.initialPosition).toEqual({
        lat: 10,
        lng: 12,
      });
    });

    it('expect to render with map options', () => {
      const props = {
        ...defaultProps,
        streetViewControl: true,
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const providerProps = {
        ...defaultProviderProps,
      };

      const connectorPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerPropsWrapper = shallow(
        <ShallowWapper>
          {renderProvider({ connectorPropsWrapper, providerProps })}
        </ShallowWapper>
      );

      const googleMapProps = providerPropsWrapper
        .find('[testID="GoogleMaps"]')
        .props();

      expect(googleMapProps.mapOptions).toEqual({
        streetViewControl: true,
      });
    });

    it('expect to render with boundingBox', () => {
      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const providerProps = {
        ...defaultProviderProps,
        boundingBox: {
          northEast: {
            lat: 10,
            lng: 12,
          },
          southWest: {
            lat: 12,
            lng: 14,
          },
        },
      };

      const connectorPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerPropsWrapper = shallow(
        <ShallowWapper>
          {renderProvider({ connectorPropsWrapper, providerProps })}
        </ShallowWapper>
      );

      const googleMapProps = providerPropsWrapper
        .find('[testID="GoogleMaps"]')
        .props();

      expect(googleMapProps.boundingBox).toEqual({
        northEast: {
          lat: 10,
          lng: 12,
        },
        southWest: {
          lat: 12,
          lng: 14,
        },
      });
    });

    it('expect to render with boundingBoxPadding', () => {
      const props = {
        ...defaultProps,
      };

      const connectorProps = {
        ...defaultConnectorProps,
      };

      const providerProps = {
        ...defaultProviderProps,
        boundingBoxPadding: 10,
      };

      const connectorPropsWrapper = shallow(
        <ShallowWapper>
          {renderConnector({ props, connectorProps })}
        </ShallowWapper>
      );

      const providerPropsWrapper = shallow(
        <ShallowWapper>
          {renderProvider({ connectorPropsWrapper, providerProps })}
        </ShallowWapper>
      );

      const googleMapProps = providerPropsWrapper
        .find('[testID="GoogleMaps"]')
        .props();

      expect(googleMapProps.boundingBoxPadding).toBe(10);
    });
  });
});
