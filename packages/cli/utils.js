function camelCase(string) {
  return string.replace(/-([a-z])/g, str => str[1].toUpperCase());
}

function getOptionsFromArguments(rawArgs) {
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
}

function isQuestionAsked({ question, args }) {
  for (const optionName in args) {
    if (question.name === optionName) {
      // Skip if the arg in the command is valid
      if (question.validate && question.validate(args[optionName])) {
        return false;
      }
    } else if (!question.validate) {
      // Skip if the question is optional and not given in the command
      return false;
    }
  }

  return true;
}

module.exports = {
  camelCase,
  getOptionsFromArguments,
  isQuestionAsked,
};
