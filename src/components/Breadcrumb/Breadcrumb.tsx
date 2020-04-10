/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';

type BreadcrumbItem = {
  value: string;
  label: string;
};

type BreadcrumbCSSClasses = {
  root: string;
  noRefinementRoot: string;
  list: string;
  item: string;
  selectedItem: string;
  link: string;
  separator: string;
};

type BreadcrumbTemplates = {
  home: string;
  separator: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  cssClasses: BreadcrumbCSSClasses;
  templateProps: {
    templates: BreadcrumbTemplates;
  };
  createURL(value: string | undefined): string;
  refine(value: string | undefined): void;
  canRefine?: boolean;
};

const Breadcrumb = ({
  items,
  cssClasses,
  templateProps,
  createURL,
  refine,
}: BreadcrumbProps) => (
  <div
    className={cx(cssClasses.root, {
      [cssClasses.noRefinementRoot]: items.length === 0,
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
            href: createURL(undefined),
            onClick: (event: MouseEvent) => {
              event.preventDefault();
              refine(undefined);
            },
          }}
        />
      </li>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <li
            key={item.label + idx}
            className={cx(cssClasses.item, {
              [cssClasses.selectedItem]: isLast,
            })}
          >
            <Template
              {...templateProps}
              templateKey="separator"
              rootTagName="span"
              rootProps={{
                className: cssClasses.separator,
                'aria-hidden': true,
              }}
            />
            {isLast ? (
              item.label
            ) : (
              <a
                className={cssClasses.link}
                href={createURL(item.value)}
                onClick={event => {
                  event.preventDefault();
                  refine(item.value);
                }}
              >
                {item.label}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);

export default Breadcrumb;
