import { test, expect } from '../fixtures';

test.describe('state and route', () => {
  test.describe('read', () => {
    test('reads initial state from route', async ({ page, helpers }) => {
      const params = new URLSearchParams({
        query: 'mixer',
        page: '2',
        brands: 'KitchenAid',
        rating: '4',
        price: '50:350',
        free_shipping: 'true',
        sortBy: 'instant_search_price_desc',
        hitsPerPage: '32',
      });
      await page.goto(
        `search/Appliances%2FSmall+Kitchen+Appliances/?${params.toString()}`
      );

      // Must have "mixer" set as initial search box value
      const searchBoxValue = await helpers.getSearchBoxValue();
      expect(searchBoxValue).toEqual('mixer');

      // Must have "Appliances" and "Small Kitchen Appliances" items selected in the category menu
      const items = await helpers.getSelectedHierarchicalMenuItems();
      expect(items).toEqual(['Appliances', 'Small Kitchen Appliances']);

      // Must have "KitchenAid" brand selected in the brands menu
      const brand = await helpers.getSelectedRefinementListItem();
      expect(brand).toEqual('KitchenAid');

      // Must have lower price set to $50 and the upper price set to $350 in the price range
      const lowerPrice = await helpers.getRangeSliderLowerBoundValue();
      const upperPrice = await helpers.getRangeSliderUpperBoundValue();
      expect(lowerPrice).toEqual(50);
      expect(upperPrice).toEqual(350);

      // Must have free shipping box checked
      const freeShipping = await helpers.getToggleRefinementStatus();
      expect(freeShipping).toEqual(true);

      // Must have rating "4 & up" selected in the rating menu
      const rating = await helpers.getSelectedRatingMenuItem();
      expect(rating).toEqual('4 & up');

      // Must have "Price descending" selected in the sort select
      const sortBy = await helpers.getSortByValue();
      expect(sortBy).toEqual('instant_search_price_desc');

      // Must have "32 hits per page" selected in the hits per page select
      const hitsPerPage = await helpers.getHitsPerPage();
      expect(hitsPerPage).toEqual(32);

      // Must have page 2 selected in the pagination
      const currentPage = await helpers.getCurrentPage();
      expect(currentPage).toEqual(2);

      // Must have the expected results
      const hitsTitles = await helpers.getHitsTitles();
      expect(hitsTitles).toEqual([
        'KitchenAid - 9-Speed Hand Mixer - Onyx Black',
        'KitchenAid - Attachment Pack with Citrus Juicer for Most KitchenAid Stand Mixers - White',
        'KitchenAid - Ice Cream Maker for Most KitchenAid Stand Mixers - White',
        'KitchenAid - Pasta Sheet Roller for Most KitchenAid Stand Mixers - Silver',
        'KitchenAid - 7-Speed Hand Mixer - Contour Silver',
        'KitchenAid - 7-Speed Hand Mixer - Onyx Black',
        'KitchenAid - 7-Speed Hand Mixer - White',
        'KitchenAid - 5-Quart Glass Mixing Bowl - Frosted Glass',
        'KitchenAid - 3-Speed Hand Mixer - Contour Silver',
        'KitchenAid - 3-Speed Hand Mixer - Onyx Black',
      ]);
    });
  });

  test.describe('write', () => {
    test('updates route from state changes', async ({ page, helpers }) => {
      const params = new URLSearchParams({
        query: 'mixer',
        page: '2',
        brands: 'KitchenAid',
        rating: '4',
        price: '50:350',
        free_shipping: 'true',
        sortBy: 'instant_search_price_desc',
        hitsPerPage: '32',
      });
      await page.goto(
        `search/Appliances%2FSmall+Kitchen+Appliances/?${params.toString()}`
      );

      const priceBounds = { lower: 0, upper: 0 };

      // Deselect "KitchenAid" brand in the brands menu (do this first while still on mixer search)
      await helpers.clickRefinementListItem('KitchenAid');

      // Set "cooktop" as search box value
      await helpers.setSearchBoxValue('cooktop');

      // Deselect "Small Kitchen Appliances" items and select "Ranges, Cooktops & Ovens" in the category menu
      await helpers.clickHierarchicalMenuItem('Small Kitchen Appliances');
      await helpers.clickHierarchicalMenuItem('Ranges, Cooktops & Ovens');

      // Select "Whirlpool" brand in the brands menu
      await helpers.clickRefinementListItem('Whirlpool');

      // Uncheck free shipping box
      await helpers.clickToggleRefinement();

      // Select rating "3 & up" in the rating menu
      await helpers.clickRatingMenuItem('3 & up');

      // Select "Price ascending" in the sort select
      await helpers.setSortByValue('Price ascending');

      // Set lower price to $250 and the upper price to $1250 in the price range
      priceBounds.lower = await helpers.dragRangeSliderLowerBoundTo(250);
      priceBounds.upper = await helpers.dragRangeSliderUpperBoundTo(1250);

      // hitsPerPage is already 32 from initial URL params, no need to change
      // Select page 2 in the pagination (we have enough results with 32/page)
      await helpers.clickPage(2);

      // Must have the expected url
      await expect
        .poll(
          async () => {
            const url = new URL(page.url());
            const { pathname, searchParams } = url;

            return (
              pathname.includes(
                'search/Appliances%2FRanges%2C+Cooktops+%26+Ovens/'
              ) &&
              searchParams.get('query') === 'cooktop' &&
              searchParams.get('page') === '2' &&
              searchParams.get('brands') === 'Whirlpool' &&
              searchParams.get('rating') === '3' &&
              searchParams.get('price') ===
                `${priceBounds.lower}:${priceBounds.upper}` &&
              searchParams.get('sortBy') === 'instant_search_price_asc' &&
              searchParams.get('hitsPerPage') === '32'
            );
          },
          { message: 'URL does not have expected parameters' }
        )
        .toBe(true);
    });
  });
});
