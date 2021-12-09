import renderTemplate from '../renderTemplate';
import createHelpers from '../../createHelpers';
import { insights } from '../../../helpers';

describe('insights hogan helper', () => {
  const helpers = createHelpers({ numberLocale: 'en-US' });
  it('should produce the same output as the insights function', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    const output = renderTemplate({
      templateKey: 'item',
      templates: {
        item: `
        <button {{#helpers.insights}}{
          "method": "clickedObjectIDsAfterSearch",
          "payload": {"eventName": "Add to cart"}
        }{{/helpers.insights}}>Add to cart</button>
        `,
      },
      helpers,
      data: {
        objectID: 'xxx',
      },
    });

    const expected = `<button ${insights('clickedObjectIDsAfterSearch', {
      objectIDs: ['xxx'],
      eventName: 'Add to cart',
    })}>Add to cart</button>
    `;

    expect(output.trim()).toEqual(expected.trim());

    expect(warn).toHaveBeenLastCalledWith(
      `[InstantSearch.js]: \`insights\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`
    );

    warn.mockReset();
    warn.mockRestore();
  });

  it('should throw an error if the provided string cannot be JSON parsed', () => {
    expect(() =>
      renderTemplate({
        templateKey: 'item',
        templates: {
          item: `
        <button {{#helpers.insights}}{ 
            invalid json
        }{{/helpers.insights}}>Add to cart</button>
        `,
        },
        helpers,
        data: {
          objectID: 'xxx',
        },
      })
    ).toThrowErrorMatchingInlineSnapshot(`
"
The insights helper expects a JSON object of the format:
{ \\"method\\": \\"method-name\\", \\"payload\\": { \\"eventName\\": \\"name of the event\\" } }"
`);
  });
});
