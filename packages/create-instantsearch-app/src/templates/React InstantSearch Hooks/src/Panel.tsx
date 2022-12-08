import React from 'react';

type PanelProps = React.PropsWithChildren<{
  header: string;
}>;

export function Panel({ header, children }: PanelProps) {
  return (
    <div className="ais-Panel">
      <div className="ais-Panel-header">
        <span>{header}</span>
      </div>
      <div className="ais-Panel-body">{children}</div>
    </div>
  );
}
