/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import type { PitProps } from './Rheostat';

const Pit = ({ style, children }: PitProps) => {
  // first, end & middle
  const positionValue = Math.round(parseFloat(style.left as string));
  const shouldDisplayValue = [0, 50, 100].includes(positionValue);

  const value = children as string;
  const pitValue = Math.round(parseInt(value, 10) * 100) / 100;

  return (
    <div
      style={{ ...style, marginLeft: positionValue === 100 ? '-2px' : 0 }}
      className={cx(
        'rheostat-marker',
        'rheostat-marker-horizontal',
        shouldDisplayValue && 'rheostat-marker-large'
      )}
    >
      {shouldDisplayValue && <div className={'rheostat-value'}>{pitValue}</div>}
    </div>
  );
};

export default Pit;
