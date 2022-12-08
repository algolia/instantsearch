module.exports = function getAnswersDefaultValues(
  optionsFromArguments,
  configuration,
  template
) {
  return {
    ...configuration,
    ...optionsFromArguments,
    template,
    // name has a default of '', as it's a special case in Commander
    name: optionsFromArguments.name || configuration.name,
  };
};
