import React, { PureComponent } from 'preact-compat';
import PropTypes from 'prop-types';
import Template from '../Template.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';

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
    ? `${cssClasses.item} ${cssClasses.selectedItem}`
    : cssClasses.item;

  return (
    <li key={item.name + idx} className={itemClassnames}>
      <Template
        rootTagName="span"
        rootProps={{ className: cssClasses.separator, ariaHidden: true }}
        templateKey="separator"
        {...templateProps}
      />
      {link}
    </li>
  );
};

const itemsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  })
);

export class RawBreadcrumb extends PureComponent {
  static propTypes = {
    createURL: PropTypes.func,
    cssClasses: PropTypes.objectOf(PropTypes.string),
    items: itemsPropType,
    refine: PropTypes.func.isRequired,
    templateProps: PropTypes.object.isRequired,
  };

  render() {
    const { createURL, items, refine, cssClasses } = this.props;

    const breadcrumb = items.map(renderLink(this.props));
    const noRefinement = items.length === 0;

    const homeClassnames = noRefinement
      ? `${cssClasses.item} ${cssClasses.selectedItem}`
      : cssClasses.item;

    const homeOnClickHandler = e => {
      e.preventDefault();
      refine(null);
    };

    const homeUrl = createURL(null);

    const rootClassnames = noRefinement
      ? `${cssClasses.root} ${cssClasses.noRefinement}`
      : cssClasses.root;

    return (
      <div className={rootClassnames}>
        <ul className={cssClasses.list}>
          <li className={homeClassnames}>
            <a
              className={cssClasses.link}
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

export default autoHideContainerHOC(RawBreadcrumb);
