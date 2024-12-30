/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import { isSpecialClick } from '../../lib/utils';
import Template from '../Template/Template';

import type { BreadcrumbConnectorParamsItem } from '../../connectors';
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
  createURL: (value: BreadcrumbConnectorParamsItem['value']) => string;
  refine: (value: BreadcrumbConnectorParamsItem['value']) => void;
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
            href: createURL(null),
            onClick: (event: MouseEvent) => {
              if (isSpecialClick(event)) {
                return;
              }
              event.preventDefault();
              refine(null);
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
                  if (isSpecialClick(event)) {
                    return;
                  }
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
