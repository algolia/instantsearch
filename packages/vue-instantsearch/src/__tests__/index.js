import Vue from 'vue';
import InstantSearch from '../instantsearch';

it('should have `name` the same as the suit class name everywhere', () => {
  Vue.component = jest.fn();
  Vue.use(InstantSearch);

  const allInstalledComponents = Vue.component.mock.calls;
  const components = allInstalledComponents.map(
    ([installedName, { name, mixins }]) => {
      let suitClass = `Error! ${name} is missing the suit classes`;

      try {
        suitClass = mixins
          .find(mixin => mixin.methods && mixin.methods.suit)
          .methods.suit();
      } catch (e) {
        /* no suit class, so will fail the assertions */
      }

      return {
        installedName,
        name,
        suitClass,
      };
    }
  );

  components.forEach(({ name, installedName, suitClass }) => {
    expect(installedName).toBe(name);
    if (name === 'AisInstantSearchSsr') {
      expect(suitClass).toBe(`ais-InstantSearch`);
    } else {
      expect(suitClass).toBe(`ais-${name.substr(3)}`);
    }
  });
});
