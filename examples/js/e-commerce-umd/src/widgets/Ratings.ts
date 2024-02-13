import { collapseButtonText } from '../templates/panel';

const { panel, ratingMenu } = window.instantsearch.widgets;

const ratingsMenu = panel<typeof ratingMenu>({
  templates: {
    header() {
      return 'Ratings';
    },
    collapseButtonText,
  },
  collapsed: () => false,
})(ratingMenu);

export const ratings = ratingsMenu({
  container: '[data-widget="ratings"]',
  attribute: 'rating',
  templates: {
    item: (hit, { html }) => {
      const stars = hit.stars.map(
        (isFilled, index) =>
          html`<svg
            key="${index}"
            class="${[
              hit.cssClasses.starIcon,
              isFilled
                ? hit.cssClasses.fullStarIcon
                : hit.cssClasses.emptyStarIcon,
            ].join(' ')}"
            aria-hidden="true"
            viewbox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"
            />
          </svg>`
      );

      if (hit.count) {
        return html`<a
          class="${hit.cssClasses.link}"
          aria-label="${hit.value} & up"
          href="${hit.url}"
        >
          ${stars}
          <span class="${hit.cssClasses.count}">
            ${hit.count.toLocaleString()}</span
          >
        </a>`;
      }

      return html`<div
        class="${hit.cssClasses.link}"
        aria-label="${hit.value} & up"
        disabled
      >
        ${stars}
      </div>`;
    },
  },
});

export function getFallbackRatingsRoutingValue(
  value: string
): string | undefined {
  const ratingValue = Number(value);

  if (ratingValue >= 1 && ratingValue <= 4) {
    return value;
  }

  return undefined;
}
