import { brandAndQuery } from './specs/brand-and-query.spec';
import { category } from './specs/category.spec';
import { initialStateFromRoute } from './specs/initial-state-from-route.spec';
import { pagination } from './specs/pagination.spec';
import { priceRange } from './specs/price-range.spec';
import { flavors } from './flavors';

flavors.forEach(flavor => {
  describe(flavor, () => {
    brandAndQuery(flavor);
    category(flavor);
    initialStateFromRoute(flavor);
    pagination(flavor);
    priceRange(flavor);
  });
});
