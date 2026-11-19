module.exports = {
  description: 'Codemods for InstantSearch libraries',
  transforms: {},
  presets: {
    'ris-v6-to-v7': require('./ris-v6-to-v7'),
    'rish-to-ris': require('./rish-to-ris'),
    'is-v4-to-v5': require('./is-v4-to-v5'),
    'addWidget-to-addWidgets': require('./addWidget-to-addWidgets'),
  },
};
