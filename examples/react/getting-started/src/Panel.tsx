import React from 'react';
import { useInstantSearch, type IndexRenderState } from 'react-instantsearch';

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
