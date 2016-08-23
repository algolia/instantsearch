import inlineProps from './inlineProps';

module.exports = function inlinePropsLoader(content) {
  try {
    return inlineProps(content);
  } catch (e) {
    return content;
  }
};
