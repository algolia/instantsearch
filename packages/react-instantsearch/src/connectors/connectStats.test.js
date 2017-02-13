/* eslint-env jest, jasmine */

import connect from './connectStats';
jest.mock('../core/createConnector');

let props;
describe('connectStats', () => {
  describe('single index', () => {
    const context = {context: {multiIndexContext: {targettedIndex: 'index'}}};
    const getProvidedProps = connect.getProvidedProps.bind(context);
    it('provides the correct props to the component', () => {
      props = getProvidedProps(null, null, {});
      expect(props).toBe(null);

      props = getProvidedProps(null, null, {results: {index: {nbHits: 666, processingTimeMS: 1}}});
      expect(props).toEqual({nbHits: 666, processingTimeMS: 1});
    });
  });
  describe('multi index', () => {
    const context = {context: {ais: {mainTargettedIndex: 'first'}, multiIndexContext: {targettedIndex: 'second'}}};
    const getProvidedProps = connect.getProvidedProps.bind(context);
    it('provides the correct props to the component', () => {
      props = getProvidedProps(null, null, {});
      expect(props).toBe(null);

      props = getProvidedProps(null, null, {results: {second: {nbHits: 666, processingTimeMS: 1}}});
      expect(props).toEqual({nbHits: 666, processingTimeMS: 1});
    });
  });
});
