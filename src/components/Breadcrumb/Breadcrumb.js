import React, { PureComponent } from 'preact-compat';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Template from '../Template.js';

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  })
);

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
      onClick={e => {
        e.preventDefault();
        refine(item.value);
      }}
    >
      {item.name}
    </a>
  );

  const itemClassnames = isLast
    ? cx(cssClasses.item, cssClasses.selectedItem)
    : cx(cssClasses.item);

  return (
    <li key={item.name + idx} className={itemClassnames}>
      <Template
        rootTagName="span"
        rootProps={{ className: cx(cssClasses.separator), ariaHidden: true }}
        templateKey="separator"
        {...templateProps}
      />
      {link}
    </li>
  );
};

class Breadcrumb extends PureComponent {
  static propTypes = {
    createURL: PropTypes.func,
    cssClasses: PropTypes.objectOf(PropTypes.string),
    items: itemsPropType,
    refine: PropTypes.func.isRequired,
    separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    templateProps: PropTypes.object.isRequired,
    translate: PropTypes.func,
  };

  render() {
    const { createURL, items, refine, cssClasses } = this.props;

    const breadcrumb = items.map(renderLink(this.props));

    const homeClassnames =
      items.length === 0
        ? cx(cssClasses.item, cssClasses.selectedItem)
        : cx(cssClasses.item);

    const rootClassnames =
      items.length === 0
        ? cx(cssClasses.root)
        : cx(cssClasses.root, cssClasses.noRefinement);

    const homeOnClickHandler = e => {
      e.preventDefault();
      refine(null);
    };

    const homeUrl = createURL(null);

    return (
      <div className={rootClassnames}>
        <ul className={cx(cssClasses.list)}>
          <li className={homeClassnames}>
            <a
              className={cx(cssClasses.link)}
              href={homeUrl}
              onClick={homeOnClickHandler}
            >
              <Template templateKey="home" {...this.props.templateProps} />
            </a>
          </li>
          {breadcrumb}
        </ul>
      </div>
    );
  }
}

export default Breadcrumb;
