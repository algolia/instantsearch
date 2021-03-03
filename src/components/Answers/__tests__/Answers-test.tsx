/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import Answers, { AnswersProps } from '../Answers';

const defaultProps: AnswersProps = {
  hits: [],
  isLoading: false,
  cssClasses: {
    root: 'root',
    header: 'header',
    emptyRoot: 'empty',
    loader: 'loader',
    list: 'list',
    item: 'item',
  },
  templateProps: {
    templates: {
      header: 'header',
      loader: 'loader',
      item: 'item',
    },
  },
};

describe('Answers', () => {
  describe('Rendering', () => {
    it('renders without anything', () => {
      const { container } = render(<Answers {...defaultProps} />);
      expect(container.querySelector('.root')).toHaveClass('empty');
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="root empty"
          >
            <div
              class="header"
            >
              header
            </div>
            <ul
              class="list"
            />
          </div>
        </div>
      `);
    });

    it('renders the loader', () => {
      const { container } = render(
        <Answers {...defaultProps} isLoading={true} />
      );
      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root empty"
  >
    <div
      class="header"
    >
      header
    </div>
    <div
      class="loader"
    >
      loader
    </div>
  </div>
</div>
`);
    });

    it('renders the header with data', () => {
      const props: AnswersProps = {
        ...defaultProps,
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            header: ({ hits, isLoading }) => {
              return `${hits.length} answer(s) ${
                isLoading ? 'loading' : 'loaded'
              }`;
            },
          },
        },
      };
      const { container } = render(
        <Answers
          {...props}
          isLoading={false}
          hits={[{ objectID: '1', __position: 1 }]}
        />
      );
      expect(container.querySelector('.header')).toHaveTextContent(
        '1 answer(s) loaded'
      );
    });

    it('renders the answers', () => {
      const props: AnswersProps = {
        ...defaultProps,
        templateProps: {
          templates: {
            ...defaultProps.templateProps.templates,
            item: hit => {
              return `answer: ${hit.title}`;
            },
          },
        },
      };
      const { container } = render(
        <Answers
          {...props}
          isLoading={false}
          hits={[{ objectID: '1', title: 'hello!', __position: 1 }]}
        />
      );
      expect(container.querySelector('.list')).toHaveTextContent(
        'answer: hello!'
      );
    });
  });
});
