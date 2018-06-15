const camelCase = require('lodash.camelcase');

module.exports = function getOptionsFromArguments(rawArgs) {
  let argIndex = 0;

  return rawArgs.reduce((allArgs, currentArg) => {
    argIndex++;

    if (!currentArg.startsWith('--') || currentArg.startsWith('--no-')) {
      return allArgs;
    }

    const argumentName = camelCase(currentArg.split('--')[1]);
    const argumentValue = rawArgs[argIndex];

    return {
      ...allArgs,
      [argumentName]: argumentValue,
    };
  }, {});
};
