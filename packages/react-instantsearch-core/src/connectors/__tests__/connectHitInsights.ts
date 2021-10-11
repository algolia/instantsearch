import connectReal from '../connectHitInsights';

jest.mock('../../core/createConnector', () => (x) => x);
// our mock implementation is diverging from the regular createConnector,
// so we redefine it as `any` here, since we have no more information
// @TODO: refactor these tests to work better with TS
const connect: (client) => any = connectReal;

function setup() {
  const insightsClient = jest.fn();

  const contextValue = {
    mainTargetedIndex: 'firstIndex',
  };
  const indexContextValue = {
    targetedIndex: 'theIndex',
  };

  const hit = {
    objectID: 'objectID_42',
    __position: 42,
    __queryID: 'theQueryID',
  };
  const searchResults = { results: { theIndex: { index: 'theIndex' } } };
  const props = connect(insightsClient).getProvidedProps(
    { hit, contextValue, indexContextValue },
    null,
    searchResults
  );
  return { insightsClient, props };
}

describe('connectHitInsights', () => {
  it('should expose an `insights` property', () => {
    const { props } = setup();
    expect(props).toHaveProperty('insights');
  });

  it('exposed `insights` should be a function', () => {
    const { props } = setup();
    expect(typeof props.insights).toBe('function');
  });

  describe('when called with `clickedObjectIDsAfterSearch`', () => {
    let insightsClient;
    beforeEach(() => {
      const { insightsClient: aa, props } = setup();
      insightsClient = aa;
      props.insights('clickedObjectIDsAfterSearch', {
        eventName: 'Add to cart',
      });
    });

    it('should forward call to insightsClient with the correct payload', () => {
      expect(insightsClient).toHaveBeenCalledTimes(1);
      const [method, payload] = insightsClient.mock.calls[0];
      expect(method).toEqual('clickedObjectIDsAfterSearch');
      expect(payload).toEqual({
        eventName: 'Add to cart',
        objectIDs: ['objectID_42'],
        positions: [42],
        queryID: 'theQueryID',
        index: 'theIndex',
      });
    });
  });

  describe('when called with `convertedObjectIDsAfterSearch`', () => {
    let insightsClient;
    beforeEach(() => {
      const { insightsClient: aa, props } = setup();
      insightsClient = aa;
      props.insights('convertedObjectIDsAfterSearch', {
        eventName: 'Add to cart',
      });
    });

    it('should forward call to insightsClient with the correct payload', () => {
      expect(insightsClient).toHaveBeenCalledTimes(1);

      const [method, payload] = insightsClient.mock.calls[0];
      expect(method).toEqual('convertedObjectIDsAfterSearch');
      expect(payload).toEqual({
        eventName: 'Add to cart',
        objectIDs: ['objectID_42'],
        queryID: 'theQueryID',
        index: 'theIndex',
      });
    });
  });

  describe('when called with an unsupported method', () => {
    it('should reject the call', () => {
      expect(() => {
        const { props } = setup();
        // @ts-ignore
        props.insights('wrong-method-name', {
          eventName: 'Add to cart',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Unsupported method \\"wrong-method-name\\" passed to the insights function. The supported methods are: \\"clickedObjectIDsAfterSearch\\", \\"convertedObjectIDsAfterSearch\\"."`
      );
    });
  });

  describe('when queryID is undefined', () => {
    it('should throw an error message inviting to add clickAnalytics: true', () => {
      const insightsClient = jest.fn();

      const contextValue = {
        mainTargetedIndex: 'firstIndex',
      };
      const indexContextValue = {
        targetedIndex: 'theIndex',
      };

      const hit = {
        objectID: 'objectID_42',
        __position: 42,
        // no queryID
      };

      const searchResults = { results: { theIndex: { index: 'theIndex' } } };
      const props = connect(insightsClient).getProvidedProps(
        { hit, contextValue, indexContextValue },
        null,
        searchResults
      );

      expect(() => {
        props.insights('clickedObjectIDsAfterSearch', {
          eventName: 'Add to wishlist',
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"Could not infer \`queryID\`. Ensure \`clickAnalytics: true\` was added with the Configure widget.
See: https://alg.li/VpPpLt"
`);
    });
  });
});
