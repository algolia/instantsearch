export default function createConfigManager(onUpdate) {
  const configures = [];
  let batched = false;

  // The config manager's updates need to be batched since many components can
  // register/swap/unregister their config during the same tick, but we only
  // ever want to apply an update once.
  function batchUpdate() {
    if (batched) {
      return;
    }
    batched = true;
    process.nextTick(() => {
      batched = false;
      onUpdate();
    });
  }

  return {
    register(configure) {
      configures.push(configure);
      if (onUpdate) {
        batchUpdate();
      }
    },
    swap(configure, nextConfigure) {
      configures.splice(configures.indexOf(configure), 1, nextConfigure);
      if (onUpdate) {
        batchUpdate();
      }
    },
    unregister(configure) {
      configures.splice(configures.indexOf(configure), 1);
      if (onUpdate) {
        batchUpdate();
      }
    },
    getState(initialState) {
      return configures.reduce(
        (state, conf) => conf(state),
        initialState
      );
    },
  };
}
