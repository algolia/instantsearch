import React from 'react';

type ShowMoreButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isShowingMore: boolean;
};

export function ShowMoreButton({
  isShowingMore,
  ...props
}: ShowMoreButtonProps) {
  return (
    <button {...props}>{isShowingMore ? 'Show less' : 'Show more'}</button>
  );
}
