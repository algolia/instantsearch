module.exports = function isQuestionAsked({ question, args }) {
  if (args.config) {
    return false;
  }

  for (const optionName in args) {
    if (question.name === optionName) {
      // Skip if the arg in the command is valid
      if (
        !question.validate ||
        (question.validate && question.validate(args[optionName]))
      ) {
        return false;
      }
    } else if (!question.validate) {
      // Skip if the question is optional and not given in the command
      return false;
    }
  }

  return true;
};
