/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';

const GeoSearchToggle = ({
  classNameLabel,
  classNameInput,
  checked,
  onToggle,
  children,
}) => (
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

GeoSearchToggle.propTypes = {
  classNameLabel: PropTypes.string.isRequired,
  classNameInput: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default GeoSearchToggle;
