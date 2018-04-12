import suit from '../suit';

export default {
  data() {
    return {
      state: {
        refine: jest.fn(),
      },
    };
  },
  methods: {
    suit(...args) {
      return suit(this.widgetName, ...args);
    },
  },
};
