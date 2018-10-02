import React from 'preact-compat';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Template from '../Template.js';

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
        rootTagName="span"
        rootProps={{ className: cssClasses.separator, 'aria-hidden': true }}
        templateKey="separator"
        {...templateProps}
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
}) => {
  const rootClassnames = cx(cssClasses.root, {
    [cssClasses.noRefinement]: items.length > 0,
  });
  const homeClassnames = cx(cssClasses.item, {
    [cssClasses.selectedItem]: items.length === 0,
  });

  const homeOnClickHandler = event => {
    event.preventDefault();
    refine(null);
  };

  const homeUrl = createURL(null);
  const breadcrumb = items.map(
    renderLink({ cssClasses, createURL, refine, templateProps })
  );

  return (
    <div className={rootClassnames}>
      <ul className={cssClasses.list}>
        <li className={homeClassnames}>
          <Template
            {...templateProps}
            templateKey="home"
            rootTagName="a"
            rootProps={{
              className: cssClasses.link,
              href: homeUrl,
              onClick: homeOnClickHandler,
            }}
          />
        </li>
        {breadcrumb}
      </ul>
    </div>
  );
};

Breadcrumb.propTypes = {
  createURL: PropTypes.func,
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
      name: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  refine: PropTypes.func.isRequired,
  separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  templateProps: PropTypes.object.isRequired,
  translate: PropTypes.func,
};

export default Breadcrumb;
