/** @jsx h */

import { h } from 'preact';
import Template, { TemplateProps } from '../Template';
import { render } from '@testing-library/preact';

type TemplateData = {
  items: string[];
};

const defaultProps: TemplateProps<TemplateData> = {
  template: 'Template content',
  data: {
    items: [],
  },
};

describe('Template', () => {
  it('can configure custom rootTagName', () => {
    const props = {
      ...defaultProps,
      rootTagName: 'span',
    };

    const { container } = render(<Template {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('forward rootProps to the first node', () => {
    function onClick() {}
    const props = {
      ...defaultProps,
      rootProps: { className: 'className', onClick },
    };

    const { container } = render(<Template {...props} />);

    expect(container).toMatchSnapshot();
  });

  describe('memo', () => {
    let renderCount: number;

    beforeEach(() => {
      renderCount = 0;
    });

    it('does not render when `data` does not change', () => {
      const props = {
        ...defaultProps,
        template: () => {
          renderCount++;
          return 'test';
        },
      };

      const { rerender } = render(<Template {...props} />);
      rerender(<Template {...props} />);

      expect(renderCount).toEqual(1);
    });

    it('renders when `data` changes', () => {
      const props = {
        ...defaultProps,
        template: () => {
          renderCount++;
          return 'test';
        },
      };

      const { rerender } = render(<Template {...props} />);

      expect(renderCount).toEqual(1);

      const newProps = {
        ...props,
        data: { items: ['1'] },
      };

      rerender(<Template {...newProps} />);

      expect(renderCount).toEqual(2);
    });

    it('renders when `rootProps` changes', () => {
      const props = {
        ...defaultProps,
        template: () => {
          renderCount++;
          return 'test';
        },
      };

      const { rerender } = render(<Template {...props} />);

      expect(renderCount).toEqual(1);

      const newProps = {
        ...props,
        rootProps: {
          className: 'className',
        },
      };

      rerender(<Template {...newProps} />);

      expect(renderCount).toEqual(2);
    });

    it('does not render when `rootProps` does not change', () => {
      const props = {
        ...defaultProps,
        rootProps: {
          className: 'initialClassName',
        },
        template: () => {
          renderCount++;
          return 'test';
        },
      };

      const { rerender } = render(<Template {...props} />);

      expect(renderCount).toEqual(1);

      const newProps = {
        ...props,
        rootProps: {
          className: 'initialClassName',
        },
      };

      rerender(<Template {...newProps} />);

      expect(renderCount).toEqual(1);
    });
  });
});
