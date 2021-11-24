import React from 'react';
import { useHitsPerPage, UseHitsPerPageProps } from 'react-instantsearch-hooks';
import { cx } from '../cx';

export type HitsPerPageProps = React.ComponentProps<'div'> &
  UseHitsPerPageProps;

export function HitsPerPage(props: HitsPerPageProps) {
  const { items, refine } = useHitsPerPage(props);
  const { value: currentValue } =
    items.find(({ isRefined }) => isRefined) || {};

  return (
    <div className={cx('ais-HitsPerPage', props.className)}>
      <select
        className="ais-HitsPerPage-select"
        onChange={(event) => {
          refine(Number(event.target.value));
        }}
        value={String(currentValue)}
      >
        {items.map((item) => (
          <option
            key={item.value}
            className="ais-HitsPerPage-option"
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
