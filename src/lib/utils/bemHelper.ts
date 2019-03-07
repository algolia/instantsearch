/**
 * Creates BEM class name according the vanilla BEM style.
 */
function bemHelper(block: string) {
  return function(element: string, modifier: string) {
    // block--element
    if (element && !modifier) {
      return `${block}--${element}`;
    }

    // block--element__modifier
    if (element && modifier) {
      return `${block}--${element}__${modifier}`;
    }

    // block__modifier
    if (!element && modifier) {
      return `${block}__${modifier}`;
    }

    return block;
  };
}

export default bemHelper;
