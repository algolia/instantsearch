module.exports = function getAnswersDefaultValues(
  optionsFromArguments,
  configuration,
  template
) {
  return {
    ...optionsFromArguments,
    template,
    attributesToDisplay:
      configuration.attributesToDisplay &&
      configuration.attributesToDisplay.length > 0
        ? configuration.attributesToDisplay
        : undefined,
  };
};
