import insights, {
  writeDataAttributes,
  readDataAttributes,
  hasDataAttributes,
} from '../insights';
import { warning, serializePayload } from '../../lib/utils';

const makeDomElement = (html: string): HTMLElement => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.firstElementChild as HTMLElement) || div;
};

describe('insights', () => {
  test('default behaviour', () => {
    expect(
      insights('clickedObjectIDsAfterSearch', {
        objectIDs: ['3'],
        eventName: 'Add to Cart',
      })
    ).toMatchInlineSnapshot(
      `"data-insights-method=\\"clickedObjectIDsAfterSearch\\" data-insights-payload=\\"JTdCJTIyb2JqZWN0SURzJTIyJTNBJTVCJTIyMyUyMiU1RCUyQyUyMmV2ZW50TmFtZSUyMiUzQSUyMkFkZCUyMHRvJTIwQ2FydCUyMiU3RA==\\""`
    );
  });

  it('shows a deprecation warning', () => {
    warning.cache = {};

    expect(() => {
      insights('clickedObjectIDsAfterSearch', {
        objectIDs: ['3'],
        eventName: 'Add to Cart',
      });
    }).toWarnDev(
      `[InstantSearch.js]: \`insights\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`
    );
  });
});

describe('writeDataAttributes', () => {
  it('should output a string containing data-insights-* attributes', () => {
    expect(
      writeDataAttributes({
        method: 'clickedObjectIDsAfterSearch',
        payload: {
          objectIDs: ['3'],
          eventName: 'Add to Cart',
        },
      })
    ).toMatchInlineSnapshot(
      `"data-insights-method=\\"clickedObjectIDsAfterSearch\\" data-insights-payload=\\"JTdCJTIyb2JqZWN0SURzJTIyJTNBJTVCJTIyMyUyMiU1RCUyQyUyMmV2ZW50TmFtZSUyMiUzQSUyMkFkZCUyMHRvJTIwQ2FydCUyMiU3RA==\\""`
    );
  });
  it('should reject undefined payloads', () => {
    expect(() =>
      // @ts-expect-error
      writeDataAttributes({
        method: 'clickedObjectIDsAfterSearch',
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"The insights helper expects the payload to be an object."`
    );
  });
  it('should reject non object payloads', () => {
    expect(() =>
      writeDataAttributes({
        method: 'clickedObjectIDsAfterSearch',
        // @ts-expect-error
        payload: 2,
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"The insights helper expects the payload to be an object."`
    );
  });
  it('should reject non JSON serializable payloads', () => {
    const circularObject: any = { a: {} };
    circularObject.a.circle = circularObject;
    expect(() =>
      writeDataAttributes({
        method: 'clickedObjectIDsAfterSearch',
        payload: circularObject,
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not JSON serialize the payload object."`
    );
  });
});

describe('hasDataAttributes', () => {
  it('should return true when there is a data-insights-method attribute', () => {
    const domElement = makeDomElement(
      `<button
        data-insights-method="clickedObjectIDsAfterSearch"
        data-insights-payload='{"objectIDs":["3"],"eventName":"Add to Cart"}'
        > Add to Cart </button>`
    );

    expect(hasDataAttributes(domElement)).toBe(true);
  });
  it("should return false when there isn't a data-insights-method attribute", () => {
    const domElement = makeDomElement(
      `<button
        data-insights-payload='{"objectIDs":["3"],"eventName":"Add to Cart"}'
        > Add to Cart </button>`
    );

    expect(hasDataAttributes(domElement)).toBe(false);
  });
});

describe('readDataAttributes', () => {
  describe('on handwritten data-insights-* attributes', () => {
    let domElement: HTMLElement;

    beforeEach(() => {
      const payload = serializePayload({
        objectIDs: ['3'],
        eventName: 'Add to Cart',
      });
      domElement = makeDomElement(
        `<button
        data-insights-method="clickedObjectIDsAfterSearch"
        data-insights-payload="${payload}"
        > Add to Cart </button>`
      );
    });

    it('should extract the method name', () => {
      expect(readDataAttributes(domElement).method).toEqual(
        'clickedObjectIDsAfterSearch'
      );
    });

    it('should extract the payload and parse it as a json object', () => {
      expect(readDataAttributes(domElement).payload).toEqual({
        objectIDs: ['3'],
        eventName: 'Add to Cart',
      });
    });

    it('should reject invalid payload', () => {
      domElement = makeDomElement(
        `<button
        data-insights-method="clickedObjectIDsAfterSearch"
        data-insights-payload='xxx'
        > Add to Cart </button>`
      );
      expect(() =>
        readDataAttributes(domElement)
      ).toThrowErrorMatchingInlineSnapshot(
        `"The insights helper was unable to parse \`data-insights-payload\`."`
      );
    });
  });

  describe('on data-insights-* attributes generated with insights helper', () => {
    let domElement: HTMLElement;

    beforeEach(() => {
      domElement = makeDomElement(
        `<button
          ${insights('clickedObjectIDsAfterSearch', {
            objectIDs: ['3'],
            eventName: 'Add to Cart',
          })}> Add to Cart </button>`
      );
    });

    it('should extract the method name', () => {
      expect(readDataAttributes(domElement).method).toEqual(
        'clickedObjectIDsAfterSearch'
      );
    });

    it('should extract the payload and parse it as a json object', () => {
      expect(readDataAttributes(domElement).payload).toEqual({
        objectIDs: ['3'],
        eventName: 'Add to Cart',
      });
    });
  });
});
