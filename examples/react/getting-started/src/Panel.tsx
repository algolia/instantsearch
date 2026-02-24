import React from 'react';
import { useInstantSearch } from 'react-instantsearch';

import type { IndexRenderState } from 'instantsearch.js';

type PanelProps = React.PropsWithChildren<{
  header: string;
  hidden?: (state: IndexRenderState) => boolean;
}>;

export function Panel({ header, children, hidden }: PanelProps) {
  const { indexRenderState } = useInstantSearch();

  return (
    <div
      className="ais-Panel"
      hidden={hidden ? hidden(indexRenderState) : false}
    >
      <div className="ais-Panel-header">
        <span>{header}</span>
      </div>
      <div className="ais-Panel-body">{children}</div>
    </div>
  );
}
