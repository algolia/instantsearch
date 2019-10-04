/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import Template from '../Template/Template';

function RefinementListItem({
  className,
  handleClick,
  facetValueToRefine,
  isRefined,
  templateProps,
  templateKey,
  templateData,
  subItems,
}) {
  return (
    <li
      className={className}
      onClick={originalEvent => {
        handleClick({
          facetValueToRefine,
          isRefined,
          originalEvent,
        });
      }}
    >
      <Template
        {...templateProps}
        templateKey={templateKey}
        data={templateData}
      />
      {subItems}
    </li>
  );
}

RefinementListItem.propTypes = {
  facetValueToRefine: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleClick: PropTypes.func.isRequired,
  isRefined: PropTypes.bool.isRequired,
  subItems: PropTypes.object,
  templateData: PropTypes.object.isRequired,
  templateKey: PropTypes.string.isRequired,
  templateProps: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

export default RefinementListItem;
