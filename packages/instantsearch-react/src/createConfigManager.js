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
