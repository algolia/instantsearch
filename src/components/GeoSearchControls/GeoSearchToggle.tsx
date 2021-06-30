/** @jsx h */

import { h, ComponentChildren } from 'preact';

type Props = {
  classNameLabel: string;
  classNameInput: string;
  checked: boolean;
  onToggle(event: Event): void;
  children: ComponentChildren;
};

const GeoSearchToggle = ({
  classNameLabel,
  classNameInput,
  checked,
  onToggle,
  children,
}: Props) => (
  <label className={classNameLabel}>
    <input
      className={classNameInput}
      type="checkbox"
      checked={checked}
      onChange={onToggle}
    />
    {children}
  </label>
);

export default GeoSearchToggle;
