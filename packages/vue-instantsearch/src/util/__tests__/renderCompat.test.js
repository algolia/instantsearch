/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { renderCompat } from '../vue-compat';

describe('renderCompat', () => {
  it('should handle function components that return multiple children', () => {
    const wrapper = mount({
      render: renderCompat((h) => {
        function Component({ text }) {
          return h(
            'div',
            { attrs: { 'data-text': text } },
            h('span', {}, ['1']),
            h('span', {}, '2')
          );
        }
        return h(Component, { text: 'Hello world' });
      }),
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`
      <div data-text="Hello world">
        <span>
          1
        </span>
        <span>
          2
        </span>
      </div>
    `);
  });

  it('should map props to attrs when using a HTML tag', () => {
    const wrapper = mount({
      render: renderCompat((h) => {
        return h('img', {
          src: 'http://algolia.com/image.png',
          alt: 'Some image',
        });
      }),
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`
      <img src="http://algolia.com/image.png"
           alt="Some image"
      >
    `);
  });
});
