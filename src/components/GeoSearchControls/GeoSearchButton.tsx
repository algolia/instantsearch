/** @jsx h */

import { h, ComponentChildren } from 'preact';

type Props = {
  className: string;
  onClick(event: MouseEvent): void;
  children: ComponentChildren;
  disabled?: boolean;
};

const GeoSearchButton = ({
  className,
  disabled = false,
  onClick,
  children,
}: Props) => (
  <button className={className} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

export default GeoSearchButton;
