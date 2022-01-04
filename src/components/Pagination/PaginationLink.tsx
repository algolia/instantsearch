/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';

import type { PaginationComponentCSSClasses } from './Pagination';

type PageLinkProps = {
  label: string;
  ariaLabel: string;
  pageNumber: number;
  additionalClassName: string | null;
  isDisabled?: boolean;
  isSelected?: boolean;
  cssClasses: PaginationComponentCSSClasses;
  createURL(value: number): string;
  handleClick(pageNumber: number, event: MouseEvent): void;
};

function PaginationLink({
  label,
  ariaLabel,
  pageNumber,
  additionalClassName = null,
  isDisabled = false,
  isSelected = false,
  cssClasses,
  createURL,
  handleClick,
}: PageLinkProps) {
  const classes = {
    item: cx(
      cssClasses.item,
      additionalClassName,
      isDisabled && cssClasses.disabledItem,
      isSelected && cssClasses.selectedItem
    ),
    link: cssClasses.link,
  };

  if (isDisabled) {
    return (
      <li className={classes.item}>
        <span
          className={classes.link}
          dangerouslySetInnerHTML={{
            __html: label,
          }}
        />
      </li>
    );
  }

  return (
    <li className={classes.item}>
      <a
        className={classes.link}
        aria-label={ariaLabel}
        href={createURL(pageNumber)}
        onClick={(event) => handleClick(pageNumber, event)}
        dangerouslySetInnerHTML={{
          __html: label,
        }}
      />
    </li>
  );
}

export default PaginationLink;
