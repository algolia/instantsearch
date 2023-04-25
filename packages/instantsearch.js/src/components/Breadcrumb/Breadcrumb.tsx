/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import Template from '../Template/Template';

import type { BreadcrumbConnectorParamsItem } from '../../connectors/breadcrumb/connectBreadcrumb';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses } from '../../types';
import type {
  BreadcrumbCSSClasses,
  BreadcrumbTemplates,
} from '../../widgets/breadcrumb/breadcrumb';

export type BreadcrumbComponentCSSClasses =
  ComponentCSSClasses<BreadcrumbCSSClasses>;

export type BreadcrumbComponentTemplates = Required<BreadcrumbTemplates>;

export type BreadcrumbProps = {
  items: BreadcrumbConnectorParamsItem[];
  cssClasses: BreadcrumbComponentCSSClasses;
  templateProps: PreparedTemplateProps<BreadcrumbComponentTemplates>;
  createURL: (value?: string | null) => string;
  refine: (value?: string | null) => void;
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
    className={cx(
      cssClasses.root,
      items.length === 0 && cssClasses.noRefinementRoot
    )}
  >
    <ul className={cssClasses.list}>
      <li
        className={cx(
          cssClasses.item,
          items.length === 0 && cssClasses.selectedItem
        )}
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
            className={cx(cssClasses.item, isLast && cssClasses.selectedItem)}
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
