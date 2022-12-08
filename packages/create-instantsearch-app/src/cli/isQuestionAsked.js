module.exports = function isQuestionAsked({ question, args }) {
  // if there's a config, ask no questions, even if it would be invalid
  if (args.config || !args.interactive) {
    return true;
  }

  const argument = args[question.name];

  // Skip if the arg in the command is valid
  if (question.validate) {
    return question.validate(argument);
  }

  return argument !== undefined;
};
