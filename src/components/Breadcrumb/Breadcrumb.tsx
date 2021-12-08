/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template.js';
import type {
  BreadcrumbCSSClasses,
  BreadcrumbTemplates,
} from '../../widgets/breadcrumb/breadcrumb.js';
import type { ComponentCSSClasses } from '../../types/index.js';
import type { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps.js';
import type { BreadcrumbConnectorParamsItem } from '../../connectors/breadcrumb/connectBreadcrumb.js';

export type BreadcrumbComponentCSSClasses =
  ComponentCSSClasses<BreadcrumbCSSClasses>;

export type BreadcrumbComponentTemplates = Required<BreadcrumbTemplates>;

export type BreadcrumbProps = {
  items: BreadcrumbConnectorParamsItem[];
  cssClasses: BreadcrumbComponentCSSClasses;
  templateProps: PreparedTemplateProps<BreadcrumbComponentTemplates>;
  createURL(value?: string | null): string;
  refine(value?: string | null): void;
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
                onClick={(event) => {
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
