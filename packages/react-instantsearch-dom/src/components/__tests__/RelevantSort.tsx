import React from 'react';
import renderer from 'react-test-renderer';

import RelevantSort from '../RelevantSort';

import type { RelevantSortComponentProps } from '../RelevantSort';

describe('RelevantSort', () => {
  it("returns null if it's not a virtual replica", () => {
    const tree = renderer.create(
      <RelevantSort
        isVirtualReplica={false}
        isRelevantSorted={false}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toBeNull();
  });

  it('accepts a custom className', () => {
    const tree = renderer.create(
      <RelevantSort
        className="MyCustomRelevantSort"
        isVirtualReplica={true}
        isRelevantSorted={false}
        refine={() => {}}
      />
    );

    expect(tree.root.props.className.includes('MyCustomRelevantSort')).toBe(
      true
    );
  });

  it('forward isRelevantSorted to props components', () => {
    const mockTextComponent = jest.fn(() => null);

    const mockButtonTextComponent = jest.fn(() => null);

    renderer.create(
      <RelevantSort
        buttonTextComponent={mockTextComponent}
        isVirtualReplica={true}
        isRelevantSorted={true}
        refine={() => {}}
        textComponent={mockButtonTextComponent}
      />
    );

    expect(mockTextComponent).toHaveBeenCalledWith(
      {
        isRelevantSorted: true,
      },
      {}
    );
    expect(mockButtonTextComponent).toHaveBeenCalledWith(
      {
        isRelevantSorted: true,
      },
      {}
    );
  });

  it('renders with the default ButtonTextComponent', () => {
    const tree = renderer.create(
      <RelevantSort
        isVirtualReplica={true}
        isRelevantSorted={true}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-RelevantSort"
      >
        <div
          className="ais-RelevantSort-text"
        />
        <button
          className="ais-RelevantSort-button"
          onClick={[Function]}
        >
          <span>
            See all results
          </span>
        </button>
      </div>
    `);
  });

  it('renders with a custom ButtonTextComponent', () => {
    const tree = renderer.create(
      <RelevantSort
        buttonTextComponent={({
          isRelevantSorted,
        }: RelevantSortComponentProps) => (
          <span>
            {isRelevantSorted ? 'See all results' : 'See relevant results'}
          </span>
        )}
        isVirtualReplica={true}
        isRelevantSorted={true}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-RelevantSort"
      >
        <div
          className="ais-RelevantSort-text"
        />
        <button
          className="ais-RelevantSort-button"
          onClick={[Function]}
        >
          <span>
            See all results
          </span>
        </button>
      </div>
    `);
  });

  it('renders without a textComponent', () => {
    const tree = renderer.create(
      <RelevantSort
        isVirtualReplica={true}
        isRelevantSorted={false}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-RelevantSort"
      >
        <div
          className="ais-RelevantSort-text"
        />
        <button
          className="ais-RelevantSort-button"
          onClick={[Function]}
        >
          <span>
            See relevant results
          </span>
        </button>
      </div>
    `);
  });

  it('renders with a custom textComponent', () => {
    const tree = renderer.create(
      <RelevantSort
        isVirtualReplica={true}
        isRelevantSorted={false}
        refine={() => {}}
        textComponent={({ isRelevantSorted }: RelevantSortComponentProps) => (
          <p>
            {isRelevantSorted
              ? 'We removed some search results to show you the most relevant ones'
              : 'Currently showing all results'}
          </p>
        )}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-RelevantSort"
      >
        <div
          className="ais-RelevantSort-text"
        >
          <p>
            Currently showing all results
          </p>
        </div>
        <button
          className="ais-RelevantSort-button"
          onClick={[Function]}
        >
          <span>
            See relevant results
          </span>
        </button>
      </div>
    `);
  });
});
