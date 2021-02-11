/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';

import SmartSort from '../SmartSort';

const cssClasses = {
  root: 'root',
};

const templates = {
  button: ({ isSmartSorted }) => {
    return isSmartSorted ? 'See all results' : 'See relevant results';
  },
};

describe('SmartSort', () => {
  it('render the default status', () => {
    const { container } = render(
      <SmartSort
        cssClasses={cssClasses}
        templates={templates}
        isSmartSorted={false}
        refine={() => {}}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="root"
          type="button"
        >
          <span>
            See relevant results
          </span>
        </button>
      </div>
    `);
  });

  it('refine on button click', () => {
    const refine = jest.fn();
    const { getByText } = render(
      <SmartSort
        cssClasses={cssClasses}
        templates={templates}
        isSmartSorted={false}
        refine={refine}
      />
    );
    fireEvent.click(getByText('See relevant results'));
    expect(refine).toHaveBeenCalledTimes(1);
  });

  it('refine with given value', () => {
    const refine = jest.fn();
    const { getByText } = render(
      <SmartSort
        cssClasses={cssClasses}
        templates={templates}
        isSmartSorted={false}
        relevancyStrictness={30}
        refine={refine}
      />
    );
    fireEvent.click(getByText('See relevant results'));
    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(30);
  });

  it('render sorted status', () => {
    const { container } = render(
      <SmartSort
        cssClasses={cssClasses}
        templates={templates}
        isSmartSorted={true}
        refine={() => {}}
      />
    );
    expect(container).toMatchInlineSnapshot(`
<div>
  <button
    class="root"
    type="button"
  >
    <span>
      See all results
    </span>
  </button>
</div>
`);
  });

  it('refine with zero when seeing all results', () => {
    const refine = jest.fn();
    const { getByText } = render(
      <SmartSort
        cssClasses={cssClasses}
        templates={templates}
        isSmartSorted={true}
        refine={refine}
      />
    );
    fireEvent.click(getByText('See all results'));
    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith(0);
  });
});
