import { isVue3 } from '../util/vue-compat';
import mitt from 'mitt';

export const PANEL_EMITTER_NAMESPACE = 'instantSearchPanelEmitter';
export const PANEL_CHANGE_EVENT = 'PANEL_CHANGE_EVENT';

export const createPanelProviderMixin = () => ({
  props: {
    emitter: {
      type: Object,
      required: false,
      default() {
        return mitt();
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
    this.emitter.on(PANEL_CHANGE_EVENT, (value) => {
      this.updateCanRefine(value);
    });
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    this.emitter.all.clear();
  },
  methods: {
    updateCanRefine(value) {
      this.canRefine = value;
    },
  },
});

export const createPanelConsumerMixin = ({
  mapStateToCanRefine = (state) => Boolean(state.canRefine),
} = {}) => ({
  inject: {
    emitter: {
      from: PANEL_EMITTER_NAMESPACE,
      default() {
        return {
          emit: () => {},
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
    state: {
      immediate: true,
      handler(nextState, previousState) {
        if (!nextState) {
          return;
        }

        const previousCanRefine = mapStateToCanRefine(previousState || {});
        const nextCanRefine = mapStateToCanRefine(nextState);

        if (!this.hasAlreadyEmitted || previousCanRefine !== nextCanRefine) {
          this.emitter.emit(PANEL_CHANGE_EVENT, nextCanRefine);
          this.hasAlreadyEmitted = true;
        }
      },
    },
  },
});
