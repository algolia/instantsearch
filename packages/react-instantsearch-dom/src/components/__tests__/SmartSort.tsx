import React from 'react';
import renderer from 'react-test-renderer';
import SmartSort, { SmartSortComponentProps } from '../SmartSort';

describe('SmartSort', () => {
  it("returns null if it's not a virtual replica", () => {
    const tree = renderer.create(
      <SmartSort
        isVirtualReplica={false}
        isSmartSorted={false}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toBeNull();
  });

  it('accepts a custom className', () => {
    const tree = renderer.create(
      <SmartSort
        className="MyCustomSmartSort"
        isVirtualReplica={true}
        isSmartSorted={false}
        refine={() => {}}
      />
    );

    expect(tree.root.props.className.includes('MyCustomSmartSort')).toBe(true);
  });

  it('forward isSmartSorted to props components', () => {
    const mockTextComponent = jest.fn(() => null);

    const mockButtonTextComponent = jest.fn(() => null);

    renderer.create(
      <SmartSort
        buttonTextComponent={mockTextComponent}
        isVirtualReplica={true}
        isSmartSorted={true}
        refine={() => {}}
        textComponent={mockButtonTextComponent}
      />
    );

    expect(mockTextComponent).toHaveBeenCalledWith(
      {
        isSmartSorted: true,
      },
      {}
    );
    expect(mockButtonTextComponent).toHaveBeenCalledWith(
      {
        isSmartSorted: true,
      },
      {}
    );
  });

  it('renders with the default ButtonTextComponent', () => {
    const tree = renderer.create(
      <SmartSort
        isVirtualReplica={true}
        isSmartSorted={true}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-SmartSort"
      >
        <div
          className="ais-SmartSort-text"
        />
        <button
          className="ais-SmartSort-button"
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
      <SmartSort
        buttonTextComponent={({ isSmartSorted }: SmartSortComponentProps) => (
          <span>
            {isSmartSorted ? 'See all results' : 'See relevant results'}
          </span>
        )}
        isVirtualReplica={true}
        isSmartSorted={true}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-SmartSort"
      >
        <div
          className="ais-SmartSort-text"
        />
        <button
          className="ais-SmartSort-button"
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
      <SmartSort
        isVirtualReplica={true}
        isSmartSorted={false}
        refine={() => {}}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-SmartSort"
      >
        <div
          className="ais-SmartSort-text"
        />
        <button
          className="ais-SmartSort-button"
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
      <SmartSort
        isVirtualReplica={true}
        isSmartSorted={false}
        refine={() => {}}
        textComponent={({ isSmartSorted }: SmartSortComponentProps) => (
          <p>
            {isSmartSorted
              ? 'We removed some search results to show you the most relevant ones'
              : 'Currently showing all results'}
          </p>
        )}
      />
    );

    expect(tree.toJSON()).toMatchInlineSnapshot(`
      <div
        className="ais-SmartSort"
      >
        <div
          className="ais-SmartSort-text"
        >
          <p>
            Currently showing all results
          </p>
        </div>
        <button
          className="ais-SmartSort-button"
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
