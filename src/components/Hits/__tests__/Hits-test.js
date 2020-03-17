/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import { highlight } from '../../../helpers';
import { TAG_REPLACEMENT } from '../../../lib/escape-highlight';
import Hits from '../Hits';

describe('Hits', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
  };

  describe('no results', () => {
    it('should use the empty template if no results', () => {
      const props = {
        results: {
          hits: [],
        },
        templateProps: {
          templates: {
            empty: 'noresults',
          },
        },
        hits: [],
        cssClasses,
      };

      const { container } = render(<Hits {...props} />);

      expect(
        container.querySelector(`.${cssClasses.emptyRoot}`)
      ).toHaveTextContent('noresults');
    });

    it('should have empty CSS class when no results', () => {
      const props = {
        results: {
          hits: [],
        },
        templateProps: {
          templates: {
            empty: 'empty body',
          },
        },
        cssClasses,
      };

      const { container } = render(<Hits {...props} />);

      expect(container.querySelector(`.${cssClasses.root}`)).toHaveClass(
        'root'
      );
    });
  });

  describe('individual item templates', () => {
    it('should use the item template for each hit', () => {
      const hits = [
        {
          objectID: 'one',
          foo: 'bar',
        },
        {
          objectID: 'two',
          foo: 'baz',
        },
      ];
      const props = {
        results: { hits },
        hits,
        templateProps: {
          templates: { item: templateProps => JSON.stringify(templateProps) },
        },
        cssClasses,
      };

      const { container } = render(<Hits {...props} />);

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="root"
          >
            <ol
              class="list"
            >
              <li
                class="item"
              >
                {"objectID":"one","foo":"bar","__hitIndex":0}
              </li>
              <li
                class="item"
              >
                {"objectID":"two","foo":"baz","__hitIndex":1}
              </li>
            </ol>
          </div>
        </div>
      `);
    });

    it('should wrap the items in a root div element', () => {
      const props = {
        hits: [],
        results: {
          hits: [
            {
              objectID: 'one',
              foo: 'bar',
            },
            {
              objectID: 'two',
              foo: 'baz',
            },
          ],
        },
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses,
      };

      const { container } = render(<Hits {...props} />);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <ol
      class="list"
    />
  </div>
</div>
`);
    });
  });

  describe('markup', () => {
    it('should render <Hits />', () => {
      const hits = [
        {
          objectID: '1',
          foo: 'bar',
        },
        {
          objectID: 'two',
          foo: 'baz',
        },
      ];

      const props = {
        results: { hits },
        hits,
        templateProps: {
          templates: {
            item: 'item',
          },
        },
        cssClasses,
      };

      const { container } = render(<Hits {...props} />);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <ol
      class="list"
    >
      <li
        class="item"
      >
        item
      </li>
      <li
        class="item"
      >
        item
      </li>
    </ol>
  </div>
</div>
`);
    });

    it('should render <Hits /> without highlight function', () => {
      const hits = [
        {
          objectID: 'one',
          name: 'name 1',
          _highlightResult: {
            name: {
              value: `${TAG_REPLACEMENT.highlightPreTag}name 1${TAG_REPLACEMENT.highlightPostTag}`,
            },
          },
        },
        {
          objectID: 'two',
          name: 'name 2',
          _highlightResult: {
            name: {
              value: `${TAG_REPLACEMENT.highlightPreTag}name 2${TAG_REPLACEMENT.highlightPostTag}`,
            },
          },
        },
      ];

      const props = {
        results: { hits },
        hits,
        templateProps: {
          templates: {
            item(hit) {
              return highlight({
                attribute: 'name',
                hit,
              });
            },
          },
        },
        cssClasses,
      };

      const { container } = render(<Hits {...props} />);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <ol
      class="list"
    >
      <li
        class="item"
      >
        <mark
          class="ais-Highlight-highlighted"
        >
          name 1
        </mark>
      </li>
      <li
        class="item"
      >
        <mark
          class="ais-Highlight-highlighted"
        >
          name 2
        </mark>
      </li>
    </ol>
  </div>
</div>
`);
    });
  });
});
