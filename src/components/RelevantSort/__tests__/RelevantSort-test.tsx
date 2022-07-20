/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';

import type { RelevantSortComponentTemplates } from '../RelevantSort';
import RelevantSort from '../RelevantSort';

const cssClasses = {
  root: 'root',
  text: 'text',
  button: 'button',
};

const templates: RelevantSortComponentTemplates = {
  text: '',
  button: ({ isRelevantSorted }) => {
    return isRelevantSorted ? 'See all results' : 'See relevant results';
  },
};

describe('RelevantSort', () => {
  it('render nothing if not virtual replica', () => {
    const { container } = render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={templates}
        isRelevantSorted={false}
        isVirtualReplica={false}
        refine={() => {}}
      />
    );
    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  it('render the default status', () => {
    const { container } = render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={templates}
        isRelevantSorted={false}
        isVirtualReplica={true}
        refine={() => {}}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="root"
        >
          <div
            class="text"
          />
          <button
            class="button"
            type="button"
          >
            <span>
              See relevant results
            </span>
          </button>
        </div>
      </div>
    `);
  });

  it('refine on button click', () => {
    const refine = jest.fn();
    const { getByText } = render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={templates}
        isRelevantSorted={false}
        isVirtualReplica={true}
        refine={refine}
      />
    );
    fireEvent.click(getByText('See relevant results'));
    expect(refine).toHaveBeenCalledTimes(1);
  });

  it('render sorted status', () => {
    const { container } = render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={templates}
        isRelevantSorted={true}
        isVirtualReplica={true}
        refine={() => {}}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="root"
        >
          <div
            class="text"
          />
          <button
            class="button"
            type="button"
          >
            <span>
              See all results
            </span>
          </button>
        </div>
      </div>
    `);
  });

  it('refine with `undefined` on "See relevant results"', () => {
    const refine = jest.fn();
    const { getByText } = render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={templates}
        isRelevantSorted={false}
        isVirtualReplica={true}
        refine={refine}
      />
    );
    fireEvent.click(getByText('See relevant results'));
    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(undefined);
  });

  it('refine with `0` on "Seeing all results"', () => {
    const refine = jest.fn();
    const { getByText } = render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={templates}
        isRelevantSorted={true}
        isVirtualReplica={true}
        refine={refine}
      />
    );
    fireEvent.click(getByText('See all results'));
    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(0);
  });

  it('renders component with custom `html` templates', () => {
    const { container } = render(
      <RelevantSort
        cssClasses={cssClasses}
        templates={{
          text({ isRelevantSorted }, { html }) {
            return html`<p>
              Click the button to
              ${isRelevantSorted ? 'see all results.' : 'see relevant results.'}
            </p>`;
          },
          button({ isRelevantSorted }, { html }) {
            return html`<span
              >${isRelevantSorted
                ? 'See all results'
                : 'See relevant results'}</span
            >`;
          },
        }}
        isRelevantSorted={false}
        isVirtualReplica={true}
        refine={() => {}}
      />
    );

    expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <div
      class="text"
    >
      <p>
        Click the button to
        see relevant results.
      </p>
    </div>
    <button
      class="button"
      type="button"
    >
      <span>
        <span>
          See relevant results
        </span>
      </span>
    </button>
  </div>
</div>
`);
  });
});
