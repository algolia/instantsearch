/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentChildren, ComponentProps, Renderer } from '../types';

export type StatsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the text element
   */
  text: string | string[];
  /**
   * Class names to apply to the visually hidden announcement element
   */
  announcement: string | string[];
};

export type StatsProps = ComponentProps<'div'> & {
  classNames?: Partial<StatsClassNames>;
  /**
   * Content of the `ais-Stats-text` element.
   * `null` omits the element entirely — the JS flavor's `templates.text`
   * used to own that span and removed it when resolving to `null`.
   */
  text?: ComponentChildren;
  /**
   * Renders in place of the whole `ais-Stats-text` element, for example
   * Vue's default slot. The announcement element is still rendered.
   */
  textComponent?: () => JSX.Element | null;
  /**
   * Text announced to assistive technologies. The flavor owns when it
   * changes (it's debounced so that rapid updates settle into a single
   * announcement).
   */
  announcement?: string;
};

const visuallyHiddenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export function createStatsComponent({ createElement }: Renderer) {
  return function Stats(userProps: StatsProps) {
    const {
      classNames = {},
      text,
      textComponent,
      announcement,
      ...props
    } = userProps;

    let textElement: JSX.Element | null = null;
    if (textComponent) {
      textElement = textComponent();
    } else if (text !== null) {
      textElement = (
        <span className={cx('ais-Stats-text', classNames.text)}>{text}</span>
      );
    }

    return (
      <div
        {...props}
        className={cx('ais-Stats', classNames.root, props.className)}
      >
        {textElement}
        <span
          className={cx('ais-Stats-announcement', classNames.announcement)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={visuallyHiddenStyle}
        >
          {announcement}
        </span>
      </div>
    );
  };
}
