module.exports = {
  description: 'Codemods for InstantSearch libraries',
  transforms: {},
  presets: {
    'ris-v6-to-v7': require('./ris-v6-to-v7'),
    'rish-to-ris': require('./rish-to-ris'),
  },
};
