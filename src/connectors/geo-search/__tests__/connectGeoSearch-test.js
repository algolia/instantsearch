import searchHelper from 'algoliasearch-helper';
import connectGeoSearch from '../connectGeoSearch';

const client = {
  addAlgoliaAgent: () => {},
};

describe('connectGeoSearch', () => {
  it('expect to be a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customGeoSearch = connectGeoSearch(render, unmount);
    const widget = customGeoSearch();

    expect(widget).toEqual({
      getConfiguration: expect.any(Function),
      init: expect.any(Function),
      render: expect.any(Function),
      dispose: expect.any(Function),
    });
  });

  it('expect to render during init and render');

  describe('getConfiguration', () => {
    describe('aroundLatLngViaIP', () => {
      it('expect to set aroundLatLngViaIP', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
        });

        const expectation = {
          aroundLatLngViaIP: true,
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it('expect to not set aroundLatLngViaIP when position is given', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {
          aroundLatLng: '12, 10',
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundLatLngViaIP when it's already set", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLngViaIP: false,
        });

        expect(actual).toEqual(expectation);
      });

      it('expect to not set aroundLatLngViaIP when aroundLatLng is already set', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          enableGeolocationWithIP: true,
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLng: '10, 12',
        });

        expect(actual).toEqual(expectation);
      });
    });

    describe('aroundLatLng', () => {
      it('expect to set aroundLatLng', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {
          aroundLatLng: '12, 10',
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it('expect to set aroundLatLng when aroundLatLngViaIP is already set to false', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {
          aroundLatLng: '12, 10',
        };

        const actual = widget.getConfiguration({
          aroundLatLngViaIP: false,
        });

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundLatLng when it's already set", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLng: '12, 12',
        });

        expect(actual).toEqual(expectation);
      });

      it('expect to not set aroundLatLng when aroundLatLngViaIP is already set to true', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          position: {
            lat: 12,
            lng: 10,
          },
        });

        const expectation = {};

        const actual = widget.getConfiguration({
          aroundLatLngViaIP: true,
        });

        expect(actual).toEqual(expectation);
      });
    });

    describe('aroundRadius', () => {
      it('expect to set aroundRadius', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          radius: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
          aroundRadius: 1000,
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundRadius when it's already defined", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          radius: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
        };

        const actual = widget.getConfiguration({
          aroundRadius: 500,
        });

        expect(actual).toEqual(expectation);
      });
    });

    describe('aroundPrecision', () => {
      it('expect to set aroundPrecision', () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          precision: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
          aroundPrecision: 1000,
        };

        const actual = widget.getConfiguration({});

        expect(actual).toEqual(expectation);
      });

      it("expect to not set aroundPrecision when it's already defined", () => {
        const render = jest.fn();
        const unmount = jest.fn();

        const customGeoSearch = connectGeoSearch(render, unmount);
        const widget = customGeoSearch({
          precision: 1000,
        });

        const expectation = {
          aroundLatLngViaIP: true,
        };

        const actual = widget.getConfiguration({
          aroundPrecision: 500,
        });

        expect(actual).toEqual(expectation);
      });
    });
  });
});
