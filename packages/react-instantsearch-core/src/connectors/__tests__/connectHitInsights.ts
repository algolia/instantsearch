import connect from '../connectHitInsights';

jest.mock('../../core/createConnector', () => x => x);

function setup() {
  const insightsClient = jest.fn();

  const createMultiIndexContext = () => ({
    context: {
      ais: {
        mainTargetedIndex: 'theFirstIndex',
      },
      multiIndexContext: {
        targetedIndex: 'theIndex',
      },
    },
  });

  const context = createMultiIndexContext();
  const getProvidedProps = connect(insightsClient).getProvidedProps.bind(
    context
  );

  const hit = {
    objectID: 'objectID_42',
    __position: 42,
    __queryID: 'theQueryID',
  };
  const searchResults = { results: { theIndex: { index: 'theIndex' } } };
  const props = getProvidedProps({ hit }, null, searchResults);
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
});
