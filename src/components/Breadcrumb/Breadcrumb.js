import React from 'preact-compat';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Template from '../Template/Template';

const renderLink = ({ cssClasses, createURL, refine, templateProps }) => (
  item,
  idx,
  items
) => {
  const isLast = idx === items.length - 1;
  const link = isLast ? (
    item.name
  ) : (
    <a
      className={cssClasses.link}
      href={createURL(item.value)}
      onClick={event => {
        event.preventDefault();
        refine(item.value);
      }}
    >
      {item.name}
    </a>
  );

  return (
    <li
      key={item.name + idx}
      className={cx(cssClasses.item, {
        [cssClasses.selectedItem]: isLast,
      })}
    >
      <Template
        {...templateProps}
        templateKey="separator"
        rootTagName="span"
        rootProps={{ className: cssClasses.separator, 'aria-hidden': true }}
      />
      {link}
    </li>
  );
};

const Breadcrumb = ({
  createURL,
  items,
  refine,
  cssClasses,
  templateProps,
}) => (
  <div
    className={cx(cssClasses.root, {
      [cssClasses.noRefinement]: items.length > 0,
    })}
  >
    <ul className={cssClasses.list}>
      <li
        className={cx(cssClasses.item, {
          [cssClasses.selectedItem]: items.length === 0,
        })}
      >
        <Template
          {...templateProps}
          templateKey="home"
          rootTagName="a"
          rootProps={{
            className: cssClasses.link,
            href: createURL(null),
            onClick: event => {
              event.preventDefault();
              refine(null);
            },
          }}
        />
      </li>

      {items.map(renderLink({ cssClasses, createURL, refine, templateProps }))}
    </ul>
  </div>
);

Breadcrumb.propTypes = {
  createURL: PropTypes.func.isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    noRefinement: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    selectedItem: PropTypes.string.isRequired,
    separator: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string,
    })
  ).isRequired,
  refine: PropTypes.func.isRequired,
  templateProps: PropTypes.object.isRequired,
};

export default Breadcrumb;
