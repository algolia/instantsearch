/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';

function PaginationLink({
  cssClasses,
  label,
  ariaLabel,
  url,
  isDisabled,
  handleClick,
  pageNumber,
}) {
  if (isDisabled) {
    return (
      <li className={cssClasses.item}>
        <span
          className={cssClasses.link}
          dangerouslySetInnerHTML={{
            __html: label,
          }}
        />
      </li>
    );
  }

  return (
    <li className={cssClasses.item}>
      <a
        className={cssClasses.link}
        aria-label={ariaLabel}
        href={url}
        onClick={event => handleClick(pageNumber, event)}
        dangerouslySetInnerHTML={{
          __html: label,
        }}
      />
    </li>
  );
}

PaginationLink.propTypes = {
  ariaLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  cssClasses: PropTypes.shape({
    item: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  }).isRequired,
  handleClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pageNumber: PropTypes.number,
  url: PropTypes.string,
};

export default PaginationLink;
