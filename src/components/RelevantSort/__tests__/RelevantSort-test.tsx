/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';

import RelevantSort from '../RelevantSort';

const cssClasses = {
  root: 'root',
  text: 'text',
  button: 'button',
};

const templates = {
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
});
