/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ColorRefinementListComponent } from '../component';
import { Layout, Shape } from '../types';
import type { ColorHit } from '../types';

describe('ColorRefinementListComponent', () => {
  const mockRefine = jest.fn();

  const mockItems: ColorHit[] = [
    {
      value: 'black',
      label: 'Black',
      count: 10,
      isRefined: false,
      hex: '#000000',
      rgb: [0, 0, 0],
      parsed: true,
    },
    {
      value: 'white',
      label: 'White',
      count: 5,
      isRefined: true,
      hex: '#ffffff',
      rgb: [255, 255, 255],
      parsed: true,
    },
    {
      value: 'red',
      label: 'Red',
      count: 8,
      isRefined: false,
      hex: '#ff0000',
      rgb: [255, 0, 0],
      parsed: true,
    },
  ];

  beforeEach(() => {
    mockRefine.mockClear();
  });

  describe('rendering', () => {
    it('renders colour swatches', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      expect(screen.getByText('Black')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
    });

    it('renders item counts', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('applies Grid layout by default', () => {
      const { container } = render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const widget = container.querySelector('.ais-ColorRefinementList');
      expect(widget).toHaveClass('ais-ColorRefinementList-layoutGrid');
    });

    it('applies List layout when specified', () => {
      const { container } = render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          layout={Layout.List}
        />
      );

      const widget = container.querySelector('.ais-ColorRefinementList');
      expect(widget).toHaveClass('ais-ColorRefinementList-layoutList');
    });

    it('applies Circle shape by default', () => {
      const { container } = render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const widget = container.querySelector('.ais-ColorRefinementList');
      expect(widget).toHaveClass('ais-ColorRefinementList-shapeCircle');
    });

    it('applies Square shape when specified', () => {
      const { container } = render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          shape={Shape.Square}
        />
      );

      const widget = container.querySelector('.ais-ColorRefinementList');
      expect(widget).toHaveClass('ais-ColorRefinementList-shapeSquare');
    });

    it('applies custom className', () => {
      const { container } = render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          className="custom-class"
        />
      );

      const widget = container.querySelector('.ais-ColorRefinementList');
      expect(widget).toHaveClass('custom-class');
    });

    it('renders refined items with refined class', () => {
      const { container } = render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const refinedItem = container.querySelector('.ais-ColorRefinementList-itemRefined');
      expect(refinedItem).toBeInTheDocument();
      expect(refinedItem).toHaveClass('ais-ColorRefinementList-itemRefined');
    });

    it('renders colour swatches with correct background colour', () => {
      const { container } = render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      // Check that colours are rendered with background colours (order may vary due to sorting)
      const blackColor = container.querySelector('.color--000000');
      const whiteColor = container.querySelector('.color--ffffff');
      const redColor = container.querySelector('.color--ff0000');

      expect(blackColor).toHaveStyle({ backgroundColor: '#000000' });
      expect(whiteColor).toHaveStyle({ backgroundColor: '#ffffff' });
      expect(redColor).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('renders colour swatches with background image for URLs', () => {
      const itemsWithUrl: ColorHit[] = [
        {
          value: 'pattern',
          label: 'Pattern',
          count: 3,
          isRefined: false,
          url: 'https://example.com/pattern.png',
          parsed: true,
        },
      ];

      const { container } = render(
        <ColorRefinementListComponent
          items={itemsWithUrl}
          refine={mockRefine}
        />
      );

      const colour = container.querySelector('.ais-ColorRefinementList-color');
      expect(colour).toHaveStyle({
        backgroundImage: 'url(https://example.com/pattern.png)',
      });
    });

    it('does not render items without hex or url', () => {
      const invalidItems: ColorHit[] = [
        {
          value: 'invalid',
          label: 'Invalid',
          count: 1,
          isRefined: false,
          parsed: true,
        },
      ];

      render(
        <ColorRefinementListComponent
          items={invalidItems}
          refine={mockRefine}
        />
      );

      expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls refine when clicking a colour', async () => {
      const user = userEvent.setup();

      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const blackButton = screen.getByRole('menuitemcheckbox', {
        name: /Refine on Black/i,
      });
      await user.click(blackButton);

      expect(mockRefine).toHaveBeenCalledWith('black');
      expect(mockRefine).toHaveBeenCalledTimes(1);
    });

    it('calls refine with correct value for refined items', async () => {
      const user = userEvent.setup();

      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const whiteButton = screen.getByRole('menuitemcheckbox', {
        name: /Refine on White/i,
      });
      await user.click(whiteButton);

      expect(mockRefine).toHaveBeenCalledWith('white');
    });
  });

  describe('show more functionality', () => {
    it('limits items when not expanded', () => {
      const manyItems = Array.from({ length: 15 }, (_, i) => ({
        value: `colour-${i}`,
        label: `Colour ${i}`,
        count: i,
        isRefined: false,
        hex: '#000000',
        rgb: [0, 0, 0] as [number, number, number],
        parsed: true,
      }));

      render(
        <ColorRefinementListComponent
          items={manyItems}
          refine={mockRefine}
          limit={5}
          showMore={true}
          isShowingMore={false}
        />
      );

      // Should only show 5 items
      const items = screen.getAllByRole('menuitemcheckbox');
      expect(items).toHaveLength(5);
    });

    it('shows more items when expanded', () => {
      const manyItems = Array.from({ length: 15 }, (_, i) => ({
        value: `colour-${i}`,
        label: `Colour ${i}`,
        count: i,
        isRefined: false,
        hex: '#000000',
        rgb: [0, 0, 0] as [number, number, number],
        parsed: true,
      }));

      render(
        <ColorRefinementListComponent
          items={manyItems}
          refine={mockRefine}
          showMore={true}
          showMoreLimit={10}
          isShowingMore={true}
        />
      );

      // Should show up to showMoreLimit
      const items = screen.getAllByRole('menuitemcheckbox');
      expect(items.length).toBeLessThanOrEqual(10);
    });

    it('renders show more button when showMore is true', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          showMore={true}
          canToggleShowMore={true}
          toggleShowMore={jest.fn()}
        />
      );

      expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    it('renders show less button when expanded', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          showMore={true}
          isShowingMore={true}
          canToggleShowMore={true}
          toggleShowMore={jest.fn()}
        />
      );

      expect(screen.getByText('Show less')).toBeInTheDocument();
    });

    it('calls toggleShowMore when clicking show more button', async () => {
      const user = userEvent.setup();
      const mockToggle = jest.fn();

      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          showMore={true}
          canToggleShowMore={true}
          toggleShowMore={mockToggle}
        />
      );

      const button = screen.getByText('Show more');
      await user.click(button);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('does not render show more button when canToggleShowMore is false', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          showMore={true}
          canToggleShowMore={false}
        />
      );

      expect(screen.queryByText('Show more')).not.toBeInTheDocument();
    });
  });

  describe('pinRefined functionality', () => {
    it('pins refined items at top when pinRefined is true and not expanded', () => {
      const itemsWithRefined: ColorHit[] = [
        {
          value: 'black',
          label: 'Black',
          count: 10,
          isRefined: false,
          hex: '#000000',
          rgb: [0, 0, 0],
          parsed: true,
        },
        {
          value: 'white',
          label: 'White',
          count: 5,
          isRefined: true,
          hex: '#ffffff',
          rgb: [255, 255, 255],
          parsed: true,
        },
        {
          value: 'red',
          label: 'Red',
          count: 8,
          isRefined: false,
          hex: '#ff0000',
          rgb: [255, 0, 0],
          parsed: true,
        },
      ];

      render(
        <ColorRefinementListComponent
          items={itemsWithRefined}
          refine={mockRefine}
          pinRefined={true}
          limit={2}
          isShowingMore={false}
        />
      );

      const items = screen.getAllByRole('menuitemcheckbox');
      // White should be first (refined), followed by Black (first non-refined)
      expect(items[0]).toHaveAttribute('aria-label', expect.stringContaining('White'));
    });
  });

  describe('translations', () => {
    it('uses default translations', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      expect(screen.getByLabelText('Refine on Black')).toBeInTheDocument();
    });

    it('uses custom translations', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          translations={{
            refineOn: (value) => `Filter by ${value}`,
            colors: (count) => `Colours (${count})`,
            showMore: (expanded) => (expanded ? 'Less' : 'More'),
          }}
        />
      );

      expect(screen.getByLabelText('Filter by Black')).toBeInTheDocument();
    });

    it('merges custom translations with defaults', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
          translations={{
            refineOn: (value) => `Custom ${value}`,
            // colors and showMore use defaults
          }}
        />
      );

      expect(screen.getByLabelText('Custom Black')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('renders items with menuitemcheckbox role', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const items = screen.getAllByRole('menuitemcheckbox');
      expect(items).toHaveLength(3);
    });

    it('sets aria-checked to true for refined items', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const whiteButton = screen.getByLabelText('Refine on White');
      expect(whiteButton).toHaveAttribute('aria-checked', 'true');
    });

    it('sets aria-checked to false for non-refined items', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const blackButton = screen.getByLabelText('Refine on Black');
      expect(blackButton).toHaveAttribute('aria-checked', 'false');
    });

    it('renders items group with aria-label', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-label', expect.stringContaining('Colors'));
    });

    it('includes refined count in aria-label', () => {
      render(
        <ColorRefinementListComponent
          items={mockItems}
          refine={mockRefine}
        />
      );

      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-label', expect.stringContaining('1 selected'));
    });
  });
});
