import { URL, URLSearchParams } from 'url';

export function createInitialStateFromRouteTestSuite(flavor: string) {
  const root = `examples/${flavor}/e-commerce/`;

  describe('state and route', () => {
    describe('read', () => {
      it('navigates to the e-commerce demo with refinements set in route', async () => {
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
        await browser.url(
          `${root}search/Appliances%2FSmall+Kitchen+Appliances/?${params.toString()}`
        );
      });

      it('must have "mixer" set as initial search box value', async () => {
        const searchBoxValue = await browser.getSearchBoxValue();

        expect(searchBoxValue).toEqual('mixer');
      });

      it('must have "Appliances" and "Small Kitchen Appliances" items selected in the category menu', async () => {
        const items = await browser.getSelectedHierarchicalMenuItems();

        expect(items).toEqual(['Appliances', 'Small Kitchen Appliances']);
      });

      it('must have "KitchenAid" brand selected in the brands menu', async () => {
        const brand = await browser.getSelectedRefinementListItem();

        expect(brand).toEqual('KitchenAid');
      });

      it('must have lower price set to $50 and the upper price set to $350 in the price range', async () => {
        const lowerPrice = await browser.getRangeSliderLowerBoundValue();
        const upperPrice = await browser.getRangeSliderUpperBoundValue();

        expect(lowerPrice).toEqual(50);
        expect(upperPrice).toEqual(350);
      });

      it('must have free shipping box checked', async () => {
        const freeShipping = await browser.getToggleRefinementStatus();

        expect(freeShipping).toEqual(true);
      });

      it('must have rating "4 & up" selected in the rating menu', async () => {
        const rating = await browser.getSelectedRatingMenuItem();

        expect(rating).toEqual('4 & up');
      });

      it('must have "Price descending" selected in the sort select', async () => {
        const sortBy = await browser.getSortByValue();

        expect(sortBy).toEqual('instant_search_price_desc');
      });

      it('must have "32 hits per page" selected in the hits per page select', async () => {
        const hitsPerPage = await browser.getHitsPerPage();

        expect(hitsPerPage).toEqual(32);
      });

      it('must have page 2 selected in the pagination', async () => {
        const page = await browser.getCurrentPage();

        expect(page).toEqual(2);
      });

      it('must have the expected results', async () => {
        const hitsTitles = await browser.getHitsTitles();

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

    describe('write', () => {
      const priceBounds = { lower: 0, upper: 0 };

      it('sets "cooktop" as search box value', async () => {
        await browser.setSearchBoxValue('cooktop');
      });

      it('deselects "KitchenAid" brand in the brands menu', async () => {
        await browser.clickRefinementListItem('KitchenAid');
      });

      it('deselects "Small Kitchen Appliances" items and select "Ranges, Cooktops & Ovens" in the category menu', async () => {
        await browser.clickHierarchicalMenuItem('Small Kitchen Appliances');
        await browser.clickHierarchicalMenuItem('Ranges, Cooktops & Ovens');
      });

      it('selects "Whirlpool" brand in the brands menu', async () => {
        await browser.clickRefinementListItem('Whirlpool');
      });

      it('unchecks free shipping box', async () => {
        await browser.clickToggleRefinement();
      });

      it('selects rating "3 & up" in the rating menu', async () => {
        await browser.clickRatingMenuItem('3 & up');
      });

      it('selects "Price ascending" in the sort select', async () => {
        await browser.setSortByValue('Price ascending');
      });

      it('sets lower price to $250 and the upper price to $1250 in the price range', async () => {
        // Depending of the steps calculation there can be a difference between
        // the wanted value and the actual value of the slider, so we store
        // the actual value to use it in for subsequent tests
        priceBounds.lower = await browser.dragRangeSliderLowerBoundTo(250);
        priceBounds.upper = await browser.dragRangeSliderUpperBoundTo(1250);
      });

      it('selects "64 hits per page" in the hits per page select', async () => {
        await browser.setHitsPerPage('64 hits per page');
      });

      it('selects page 2 in the pagination', async () => {
        await browser.clickPage(2);
      });

      it('must have the expected url', async () => {
        await browser.waitUntil(
          async () => {
            const url = await browser.getUrl();
            const { pathname, searchParams } = new URL(url);

            return (
              pathname ===
                `/${root}search/Appliances%2FRanges%2C+Cooktops+%26+Ovens/` &&
              searchParams.get('query') === 'cooktop' &&
              searchParams.get('page') === '2' &&
              searchParams.get('brands') === 'Whirlpool' &&
              searchParams.get('rating') === '3' &&
              searchParams.get('price') ===
                `${priceBounds.lower}:${priceBounds.upper}` &&
              searchParams.get('sortBy') === 'instant_search_price_asc' &&
              searchParams.get('hitsPerPage') === '64'
            );
          },
          undefined,
          'URL does not have expected parameters'
        );
      });
    });
  });
}
