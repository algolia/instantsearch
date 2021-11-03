import React from 'react';

import { useSortBy, UseSortByProps } from 'react-instantsearch-hooks';

export type SortByProps = React.ComponentProps<'div'> & UseSortByProps;
export function SortBy(props: SortByProps) {
  const { currentRefinement, options, refine } = useSortBy(props);

  return (
    <div className="ais-SortBy">
      <select
        className="ais-SortBy-select"
        onChange={(event) => refine(event.target.value)}
        defaultValue={currentRefinement}
      >
        {options.map(({ label, value }) => (
          <option className="ais-SortBy-option" key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
