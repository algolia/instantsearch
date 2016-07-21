// import {SearchParameters} from 'algoliasearch-helper';
// import union from 'lodash/array/union';
// import merge from 'lodash/object/merge';
//
// function mergeConfigs(final, partial) {
//   // The final configuration should override the partial configuration.
//   return merge(
//     {},
//     partial,
//     final,
//     (a, b) => {
//       if (Array.isArray(a)) {
//         return union(a, b);
//       }
//
//       return undefined;
//     }
//   );
// }
//
// function testConflict(config1, config2) {
//   if (
//     typeof res.hitsPerPage !== 'undefined' &&
//     typeof config.hitsPerPage !== 'undefined'
//   ) {
//     throw new Error(
//       /* eslint-disable prefer-template */
//       'Config conflict: two or more components are defining a `hitsPerPage`' +
//       'in their configure method.\n' +
//       'This usually means that you have rendered multiple <Hits /> with a ' +
//       '`hitsPerPage` prop, or multiple <HitsPerPage /> with a ' +
//       '`defaultValue` prop, or a single one of each.\n' +
//       'Only one component can control the `hitsPerPage` parameter.\n'
//       /* eslint-enable prefer-template */
//     );
//   }
// }
//
// const reasonMessage =
//
//
// function testConflict(configs, config, ignore = null) {
//   if (
//     typeof config.hitsPerPage !== 'undefined' &&
//     configs.some(c =>
//       c !== ignore && typeof c.defaultHitsPerPage !== 'undefined'
//     ) ||
//     typeof config.defaultHitsPerPage !== 'undefined' &&
//     configs.some(c =>
//       c !== ignore && typeof c.hitsPerPage !== 'undefined'
//     )
//   ) {
//     throw new Error(
//       /* eslint-disable prefer-template */
//       'Config conflict: a component is defining a `hitsPerPage` in its ' +
//       'config, but a `defaultHitsPerPage` is already set.\n' +
//       reasonMessage
//       /* eslint-enable prefer-template */
//     );
//   }
// }

export default function createConfigManager(onApply) {
  const configures = [];
  let updateQueued = false;

  return {
    register(configure) {
      configures.push(configure);
      updateQueued = true;
    },
    swap(configure, nextConfigure) {
      configures.splice(configures.indexOf(configure), 1, nextConfigure);
      updateQueued = true;
    },
    unregister(configure) {
      configures.splice(configures.indexOf(configure), 1);
      updateQueued = true;
    },
    apply() {
      if (!updateQueued) {
        return;
      }
      updateQueued = false;
      onApply();
    },
    getState(initialState) {
      return configures.reduce(
        (state, conf) => conf(state),
        initialState
      );
    },
  };
}
