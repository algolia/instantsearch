import { test as base, expect, Page } from '@playwright/test';

import {
  RANGE_SLIDER_RAIL_SELECTOR,
  RANGE_SLIDER_HANDLE_SELECTOR,
} from './helpers/selectors';

class InstantSearchHelpers {
  constructor(private page: Page) {}

  // RefinementList
  async clickRefinementListItem(label: string): Promise<void> {
    const oldUrl = this.page.url();
    const item = this.page.locator(`.ais-RefinementList-labelText`, {
      hasText: label,
    });
    await item.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async getSelectedRefinementListItem(): Promise<string> {
    const item = this.page.locator(
      '.ais-RefinementList-item--selected .ais-RefinementList-labelText'
    );
    return (await item.textContent()) || '';
  }

  // SearchBox
  async setSearchBoxValue(value: string): Promise<void> {
    const oldUrl = this.page.url();
    // Use header-scoped selector to avoid matching RefinementList search inputs
    // Support both #header (JS examples) and .header (React examples)
    const searchBox = this.page.locator(
      '#header .ais-SearchBox [type=search], .header > .ais-SearchBox [type=search], [data-widget="searchbox"] .ais-SearchBox [type=search]'
    ).first();
    const resetButton = this.page.locator(
      '#header .ais-SearchBox [type=reset], .header > .ais-SearchBox [type=reset], [data-widget="searchbox"] .ais-SearchBox [type=reset]'
    ).first();

    // Click the reset button to clear the input if visible
    if (await resetButton.isVisible()) {
      await resetButton.click();
    }

    await searchBox.click();
    await searchBox.fill(value);

    await this.page.waitForURL(
      (url) => url.href !== oldUrl && url.href.includes(value)
    );
  }

  async getSearchBoxValue(): Promise<string> {
    // Use header-scoped selector to avoid matching RefinementList search inputs
    // Support both #header (JS examples) and .header (React examples)
    const searchBox = this.page.locator(
      '#header .ais-SearchBox [type=search], .header > .ais-SearchBox [type=search], [data-widget="searchbox"] .ais-SearchBox [type=search]'
    ).first();
    return await searchBox.inputValue();
  }

  // Hits
  async getHitsTitles(): Promise<string[]> {
    const hits = this.page.locator('.hit h1');
    return await hits.allTextContents();
  }

  // HierarchicalMenu
  async clickHierarchicalMenuItem(label: string): Promise<void> {
    const oldUrl = this.page.url();
    const item = this.page.locator('.ais-HierarchicalMenu-label', {
      hasText: label,
    });
    await item.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async getSelectedHierarchicalMenuItems(): Promise<string[]> {
    await this.page
      .locator(
        '.ais-HierarchicalMenu-item--selected .ais-HierarchicalMenu-label'
      )
      .first()
      .waitFor();
    const items = this.page.locator(
      '.ais-HierarchicalMenu-item--selected .ais-HierarchicalMenu-label'
    );
    return await items.allTextContents();
  }

  // RangeSlider
  async dragRangeSliderLowerBoundTo(value: number): Promise<number> {
    const oldUrl = this.page.url();
    const slider = this.page.locator(RANGE_SLIDER_RAIL_SELECTOR);

    await this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).first().waitFor();
    const handles = this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR);
    const lowerHandle = handles.first();
    const upperHandle = handles.nth(1);

    const sliderBox = await slider.boundingBox();
    const lowerHandleBox = await lowerHandle.boundingBox();
    const lowerHandleMin = Number(
      await lowerHandle.getAttribute('aria-valuemin')
    );
    const upperHandleMax = Number(
      await upperHandle.getAttribute('aria-valuemax')
    );

    if (!sliderBox || !lowerHandleBox) {
      throw new Error('Could not get bounding boxes');
    }

    // Get the size of a step (in pixels)
    const step = sliderBox.width / (upperHandleMax - lowerHandleMin);
    // Calculate the target position
    const targetX =
      sliderBox.x + (value - lowerHandleMin) * step + lowerHandleBox.width / 2;

    await lowerHandle.dragTo(this.page.locator('body'), {
      targetPosition: {
        x: targetX,
        y: lowerHandleBox.y + lowerHandleBox.height / 2,
      },
      force: true,
    });

    await this.page.waitForURL((url) => url.href !== oldUrl);

    // Return the actual value after dragging
    const newLowerHandle = this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).first();
    return Number(await newLowerHandle.getAttribute('aria-valuenow'));
  }

  async dragRangeSliderUpperBoundTo(value: number): Promise<number> {
    const oldUrl = this.page.url();
    const slider = this.page.locator(RANGE_SLIDER_RAIL_SELECTOR);

    await this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).first().waitFor();
    const handles = this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR);
    const lowerHandle = handles.first();
    const upperHandle = handles.nth(1);

    const sliderBox = await slider.boundingBox();
    const upperHandleBox = await upperHandle.boundingBox();
    const lowerHandleMin = Number(
      await lowerHandle.getAttribute('aria-valuemin')
    );
    const upperHandleMax = Number(
      await upperHandle.getAttribute('aria-valuemax')
    );

    if (!sliderBox || !upperHandleBox) {
      throw new Error('Could not get bounding boxes');
    }

    // Get the size of a step (in pixels)
    const step = sliderBox.width / (upperHandleMax - lowerHandleMin);
    // Calculate the target position
    const targetX =
      sliderBox.x + (value - lowerHandleMin) * step + upperHandleBox.width / 2;

    await upperHandle.dragTo(this.page.locator('body'), {
      targetPosition: {
        x: targetX,
        y: upperHandleBox.y + upperHandleBox.height / 2,
      },
      force: true,
    });

    await this.page.waitForURL((url) => url.href !== oldUrl);

    // Return the actual value after dragging
    const newUpperHandle = this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).nth(1);
    return Number(await newUpperHandle.getAttribute('aria-valuenow'));
  }

  async getRangeSliderLowerBoundValue(): Promise<number> {
    await this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).first().waitFor();
    const lowerHandle = this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).first();
    return Number(await lowerHandle.getAttribute('aria-valuenow'));
  }

  async getRangeSliderUpperBoundValue(): Promise<number> {
    await this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).first().waitFor();
    const upperHandle = this.page.locator(RANGE_SLIDER_HANDLE_SELECTOR).nth(1);
    return Number(await upperHandle.getAttribute('aria-valuenow'));
  }

  // Pagination
  async clickPage(number: number): Promise<void> {
    const oldUrl = this.page.url();
    const page = this.page.locator('.ais-Pagination-link', {
      hasText: String(number),
    });
    await page.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async clickNextPage(): Promise<void> {
    const oldUrl = this.page.url();
    const nextPageLink = this.page.locator(
      '.ais-Pagination-item--nextPage .ais-Pagination-link'
    );
    await nextPageLink.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async clickPreviousPage(): Promise<void> {
    const oldUrl = this.page.url();
    const prevPageLink = this.page.locator(
      '.ais-Pagination-item--previousPage .ais-Pagination-link'
    );
    await prevPageLink.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async getCurrentPage(): Promise<number> {
    const page = this.page.locator('.ais-Pagination-item--selected');
    const text = await page.textContent();
    return Number(text);
  }

  // ToggleRefinement
  async clickToggleRefinement(): Promise<void> {
    const oldUrl = this.page.url();
    const checkbox = this.page.locator('.ais-ToggleRefinement-checkbox');
    await checkbox.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async getToggleRefinementStatus(): Promise<boolean> {
    const checkbox = this.page.locator('.ais-ToggleRefinement-checkbox');
    return await checkbox.isChecked();
  }

  // RatingMenu
  async clickRatingMenuItem(label: string): Promise<void> {
    const oldUrl = this.page.url();
    const rating = this.page.locator(
      `.ais-RatingMenu-link[aria-label="${label}"]`
    );
    await rating.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async getSelectedRatingMenuItem(): Promise<string> {
    const rating = this.page.locator(
      '.ais-RatingMenu-item--selected .ais-RatingMenu-link'
    );
    return (await rating.getAttribute('aria-label')) || '';
  }

  // SortBy
  async setSortByValue(label: string): Promise<void> {
    const oldUrl = this.page.url();
    const sortBy = this.page.locator('.ais-SortBy-select');
    await sortBy.selectOption({ label });
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async getSortByValue(): Promise<string> {
    const sortBy = this.page.locator('.ais-SortBy-select');
    return await sortBy.inputValue();
  }

  // HitsPerPage
  async setHitsPerPage(label: string): Promise<void> {
    const oldUrl = this.page.url();
    const hitsPerPage = this.page.locator('.ais-HitsPerPage-select');
    await hitsPerPage.selectOption({ label });
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  async getHitsPerPage(): Promise<number> {
    const hitsPerPage = this.page.locator('.ais-HitsPerPage-select');
    return Number(await hitsPerPage.inputValue());
  }

  // ClearRefinements
  async clickClearRefinements(): Promise<void> {
    const oldUrl = this.page.url();
    const button = this.page.locator('.ais-ClearRefinements-button');
    await button.click();
    await this.page.waitForURL((url) => url.href !== oldUrl);
  }

  // Helper for waiting for element text
  async waitForElement(selector: string): Promise<void> {
    await this.page.locator(selector).first().waitFor();
  }

  // Helper for getting text from selector
  async getTextFromSelector(selector: string): Promise<string[]> {
    const elements = this.page.locator(selector);
    return await elements.allTextContents();
  }
}

type TestFixtures = {
  helpers: InstantSearchHelpers;
};

export const test = base.extend<TestFixtures>({
  helpers: async ({ page }, use) => {
    const helpers = new InstantSearchHelpers(page);
    await use(helpers);
  },
});

export { expect };
