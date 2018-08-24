export const createPanelProviderMixin = jest.fn(() => ({}));

export const createPanelConsumerMixin = jest.fn(({ mapStateToCanRefine }) => ({
  methods: {
    mapStateToCanRefine,
  },
}));
