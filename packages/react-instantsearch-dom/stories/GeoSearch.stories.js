import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import PropTypes from 'prop-types';
import React, { Fragment, Component } from 'react';
import { Configure, Highlight, connectHits } from 'react-instantsearch-dom';
import {
  GoogleMapsLoader,
  GeoSearch,
  Marker,
  CustomMarker,
  Redo,
  Control,
} from 'react-instantsearch-dom-maps';

import Places from './places';
import { WrapWithHits } from './util';

const stories = storiesOf('GeoSearch', module);

const Container = ({ children }) => (
  <div style={{ height: 500 }}>{children}</div>
);

Container.propTypes = {
  children: PropTypes.node.isRequired,
};

const apiKey = 'AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ';
const endpoint = 'https://maps.googleapis.com/maps/api/js?v=weekly';
const initialZoom = 12;
const initialPosition = {
  lat: 40.71,
  lng: -74.01,
};

stories
  .add('default', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google}>
              {({ hits }) => (
                <Fragment>
                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with default refinement', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch
              google={google}
              defaultRefinement={{
                northEast: {
                  lat: 48.871495114865986,
                  lng: 2.398494434852978,
                },
                southWest: {
                  lat: 48.8432595812564,
                  lng: 2.326310825844189,
                },
              }}
            >
              {({ hits }) => (
                <Fragment>
                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with refine disabled', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch
              google={google}
              enableRefine={false}
              zoomControl={false}
              gestureHandling="none"
            >
              {({ hits }) => (
                <Fragment>
                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ));

// Only UI
stories
  .add('with zoom & center', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch
              google={google}
              initialZoom={initialZoom}
              initialPosition={initialPosition}
            >
              {({ hits }) => (
                <Fragment>
                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with map options', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google} streetViewControl>
              {({ hits }) => (
                <Fragment>
                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with <Marker> options', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google}>
              {({ hits }) => (
                <Fragment>
                  {hits.map((hit) => (
                    <Marker
                      key={hit.objectID}
                      hit={hit}
                      label={hit.price_formatted}
                      onClick={() => {}}
                    />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with <Marker> events', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google}>
              {({ hits }) => (
                <Fragment>
                  {hits.map((hit) => (
                    <Marker
                      key={hit.objectID}
                      hit={hit}
                      onClick={action('click')}
                    />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with <Redo> component', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google} enableRefineOnMapMove={false}>
              {({ hits }) => (
                <Fragment>
                  <Redo />

                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with <Control> component', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google}>
              {({ hits }) => (
                <Fragment>
                  <Control />

                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with <Control> component disabled', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google} enableRefineOnMapMove={false}>
              {({ hits }) => (
                <Fragment>
                  <Control />

                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with <CustomMarker>', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google}>
              {({ hits }) => (
                <Fragment>
                  <Control />

                  {hits.map((hit) => (
                    <Fragment key={hit.objectID}>
                      <CustomMarker
                        hit={hit}
                        className="my-custom-marker"
                        anchor={{ x: 0, y: 5 }}
                      >
                        {hit.price_formatted}
                      </CustomMarker>
                    </Fragment>
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ))
  .add('with <CustomMarker> events', () => (
    <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
      <Configure aroundLatLngViaIP hitsPerPage={20} />

      <Container>
        <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
          {(google) => (
            <GeoSearch google={google}>
              {({ hits }) => (
                <Fragment>
                  <Control />

                  {hits.map((hit) => (
                    <Fragment key={hit.objectID}>
                      <CustomMarker
                        hit={hit}
                        className="my-custom-marker"
                        anchor={{ x: 0, y: 5 }}
                        onClick={action('click')}
                      >
                        <span>{hit.price_formatted}</span>
                      </CustomMarker>
                    </Fragment>
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </Container>
    </WrapWithHits>
  ));

// With Places
stories.add('with Places', () => (
  <WrapWithHits indexName="airbnb" linkedStoryGroup="GeoSearch.stories.js">
    <Configure hitsPerPage={20} aroundRadius={5000} />

    <Places
      defaultRefinement={{
        lat: 37.7793,
        lng: -122.419,
      }}
    />

    <Container>
      <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
        {(google) => (
          <GeoSearch google={google} initialZoom={12}>
            {({ hits }) => (
              <Fragment>
                <Control />

                {hits.map((hit) => (
                  <Marker key={hit.objectID} hit={hit} />
                ))}
              </Fragment>
            )}
          </GeoSearch>
        )}
      </GoogleMapsLoader>
    </Container>
  </WrapWithHits>
));

stories.add('with InfoWindow', () => {
  class Example extends Component {
    static propTypes = {
      google: PropTypes.object.isRequired,
    };

    InfoWindow = new this.props.google.maps.InfoWindow();

    onClickMarker = ({ hit, marker }) => {
      if (this.InfoWindow.getMap()) {
        this.InfoWindow.close();
      }

      this.InfoWindow.setContent(hit.name);

      this.InfoWindow.open(marker.getMap(), marker);
    };

    renderGeoHit = (hit) => (
      <Marker
        key={hit.objectID}
        hit={hit}
        anchor={{ x: 0, y: 5 }}
        onClick={({ marker }) => {
          this.onClickMarker({
            hit,
            marker,
          });
        }}
      />
    );

    render() {
      const { google } = this.props;

      return (
        <WrapWithHits
          indexName="airbnb"
          linkedStoryGroup="GeoSearch.stories.js"
        >
          <Configure aroundLatLngViaIP hitsPerPage={20} />

          <Container>
            <GeoSearch google={google}>
              {({ hits }) => <Fragment>{hits.map(this.renderGeoHit)}</Fragment>}
            </GeoSearch>
          </Container>
        </WrapWithHits>
      );
    }
  }

  return (
    <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
      {(google) => <Example google={google} />}
    </GoogleMapsLoader>
  );
});

stories.add('with hits communication (custom)', () => {
  const CustomHits = connectHits(({ hits, selectedHit, onHitOver }) => (
    <div className="hits">
      {hits.map((hit) => {
        const classNames = [
          'hit',
          'hit--airbnb',
          selectedHit && selectedHit.objectID === hit.objectID
            ? 'hit--airbnb-active'
            : '',
        ];

        return (
          <div
            key={hit.objectID}
            className={classNames.join(' ').trim()}
            onMouseEnter={() => onHitOver(hit)}
            onMouseLeave={() => onHitOver(null)}
          >
            <div className="hit-content">
              <div>
                <Highlight attribute="name" hit={hit} />
                <span> - ${hit.price}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ));

  class Example extends Component {
    state = {
      selectedHit: null,
    };

    onHitOver = (hit) =>
      this.setState(() => ({
        selectedHit: hit,
      }));

    renderGeoHit = (hit) => {
      const { selectedHit } = this.state;

      const classNames = [
        'my-custom-marker',
        selectedHit && selectedHit.objectID === hit.objectID
          ? 'my-custom-marker--active'
          : '',
      ];

      return (
        <CustomMarker
          key={hit.objectID}
          hit={hit}
          anchor={{ x: 0, y: 5 }}
          onMouseEnter={() => this.onHitOver(hit)}
          onMouseLeave={() => this.onHitOver(null)}
        >
          <div className={classNames.join(' ').trim()}>
            <span>{hit.price_formatted}</span>
          </div>
        </CustomMarker>
      );
    };

    render() {
      const { selectedHit } = this.state;

      return (
        <WrapWithHits
          indexName="airbnb"
          linkedStoryGroup="GeoSearch.stories.js"
          hitsElement={
            <CustomHits selectedHit={selectedHit} onHitOver={this.onHitOver} />
          }
        >
          <Configure aroundLatLngViaIP hitsPerPage={20} />

          <Container>
            <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
              {(google) => (
                <GeoSearch google={google}>
                  {({ hits }) => (
                    <Fragment>{hits.map(this.renderGeoHit)}</Fragment>
                  )}
                </GeoSearch>
              )}
            </GoogleMapsLoader>
          </Container>
        </WrapWithHits>
      );
    }
  }

  return <Example />;
});

stories.add('with unmount', () => {
  class Example extends Component {
    state = {
      visible: true,
    };

    onToggle = () =>
      this.setState(({ visible }) => ({
        visible: !visible,
      }));

    render() {
      const { visible } = this.state;

      return (
        <WrapWithHits
          indexName="airbnb"
          linkedStoryGroup="GeoSearch.stories.js"
        >
          <Configure aroundLatLngViaIP hitsPerPage={20} />

          <button onClick={this.onToggle} style={{ marginBottom: 15 }}>
            {visible ? 'Unmout' : 'Mount'}
          </button>

          {visible && (
            <Container>
              <GoogleMapsLoader apiKey={apiKey} endpoint={endpoint}>
                {(google) => (
                  <GeoSearch google={google}>
                    {({ hits }) => (
                      <Fragment>
                        {hits.map((hit) => (
                          <Marker key={hit.objectID} hit={hit} />
                        ))}
                      </Fragment>
                    )}
                  </GeoSearch>
                )}
              </GoogleMapsLoader>
            </Container>
          )}
        </WrapWithHits>
      );
    }
  }

  return <Example />;
});
