import suit from '../util/suit';

export default {
  methods: {
    suit(...args) {
      return suit(this.widgetName, ...args);
    },
  },
};
