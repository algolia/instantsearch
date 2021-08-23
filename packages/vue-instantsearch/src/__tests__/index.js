import { isVue3, Vue2, createApp } from '../util/vue-compat';
import InstantSearch from '../instantsearch';

const renderlessComponents = ['AisExperimentalConfigureRelatedItems'];

it('should have `name` the same as the suit class name everywhere', () => {
  let calls;
  if (isVue3) {
    const app = createApp();
    app.component = jest.fn();
    app.use(InstantSearch);
    calls = app.component.mock.calls;
  } else {
    Vue2.component = jest.fn();
    Vue2.use(InstantSearch);
    calls = Vue2.component.mock.calls;
  }

  const allInstalledComponents = calls.filter(
    ([installedName]) => !renderlessComponents.includes(installedName)
  );
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
    } else if (name === 'AisExperimentalDynamicWidgets') {
      expect(suitClass).toBe(`ais-DynamicWidgets`);
    } else {
      expect(suitClass).toBe(`ais-${name.substr(3)}`);
    }
  });
});
