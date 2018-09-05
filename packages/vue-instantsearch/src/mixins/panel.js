import Vue from 'vue';

export const PANEL_EMITTER_NAMESPACE = 'instantSearchPanelEmitter';
export const PANEL_CHANGE_EVENT = 'PANEL_CHANGE_EVENT';

export const createPanelProviderMixin = () => ({
  props: {
    emitter: {
      type: Object,
      required: false,
      default() {
        return new Vue({
          name: 'PanelProvider',
        });
      },
    },
  },
  provide() {
    return {
      [PANEL_EMITTER_NAMESPACE]: this.emitter,
    };
  },
  data() {
    return {
      canRefine: true,
    };
  },
  created() {
    this.emitter.$on(PANEL_CHANGE_EVENT, value => {
      this.updateCanRefine(value);
    });
  },
  beforeDestroy() {
    this.emitter.$destroy();
  },
  methods: {
    updateCanRefine(value) {
      this.canRefine = value;
    },
  },
});

export const createPanelConsumerMixin = ({ mapStateToCanRefine }) => ({
  inject: {
    emitter: {
      from: PANEL_EMITTER_NAMESPACE,
      default() {
        return {
          $emit: () => {},
        };
      },
    },
  },
  data() {
    return {
      state: null,
      hasAlreadyEmitted: false,
    };
  },
  watch: {
    state(nextState, previousState) {
      if (!previousState || !nextState) {
        return;
      }

      const previousCanRefine = mapStateToCanRefine(previousState);
      const nextCanRefine = mapStateToCanRefine(nextState);

      if (!this.hasAlreadyEmitted || previousCanRefine !== nextCanRefine) {
        this.emitter.$emit(PANEL_CHANGE_EVENT, nextCanRefine);

        this.hasAlreadyEmitted = true;
      }
    },
  },
});
