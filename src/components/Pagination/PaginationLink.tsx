/** @jsx h */

import { h } from 'preact';

export type PaginationLinkCSSClasses = {
  item: string;
  link: string;
};

export type PaginationLinkProps = {
  ariaLabel: string;
  cssClasses: PaginationLinkCSSClasses;
  handleClick(pageNumber: number, event: MouseEvent): void;
  isDisabled: boolean;
  label: string;
  pageNumber: number;
  url?: string;
};

const PaginationLink = ({
  cssClasses,
  label,
  ariaLabel,
  url,
  isDisabled,
  handleClick,
  pageNumber,
}: PaginationLinkProps) => {
  if (isDisabled) {
    return (
      <li className={cssClasses.item}>
        <span
          className={cssClasses.link}
          dangerouslySetInnerHTML={{
            __html: label,
          }}
        />
      </li>
    );
  }

  return (
    <li className={cssClasses.item}>
      <a
        className={cssClasses.link}
        aria-label={ariaLabel}
        href={url}
        onClick={event => handleClick(pageNumber, event)}
        dangerouslySetInnerHTML={{
          __html: label,
        }}
      />
    </li>
  );
};

export default PaginationLink;
