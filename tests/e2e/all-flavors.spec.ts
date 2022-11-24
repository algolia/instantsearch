import { createBrandAndQueryTestSuite } from './specs/brand-and-query.spec';
import { createCategoryTestSuite } from './specs/category.spec';
import { createInitialStateFromRouteTestSuite } from './specs/initial-state-from-route.spec';
import { createPaginationTestSuite } from './specs/pagination.spec';
import { createPriceRangeTestSuite } from './specs/price-range.spec';

import { flavors } from './flavors';

flavors.forEach((flavor) => {
  describe(`${flavor}`, () => {
    createBrandAndQueryTestSuite(flavor);
    createCategoryTestSuite(flavor);
    createInitialStateFromRouteTestSuite(flavor);
    createPaginationTestSuite(flavor);
    createPriceRangeTestSuite(flavor);
  });
});
