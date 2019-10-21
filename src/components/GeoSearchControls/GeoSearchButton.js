/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';

const GeoSearchButton = ({ className, disabled, onClick, children }) => (
  <button className={className} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

GeoSearchButton.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
};

GeoSearchButton.defaultProps = {
  disabled: false,
};

export default GeoSearchButton;
