import React from 'react';

type PanelProps = React.PropsWithChildren<{
  header?: React.ReactNode;
  footer?: React.ReactNode;
}>;

export function Panel({ header, children, footer }: PanelProps) {
  return (
    <div className="ais-Panel">
      {Boolean(header) && (
        <div className="ais-Panel-header">
          <span>{header}</span>
        </div>
      )}
      <div className="ais-Panel-body">{children}</div>
      {Boolean(footer) && <div className="ais-Panel-footer">{footer}</div>}
    </div>
  );
}

