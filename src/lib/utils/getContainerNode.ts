import isDomElement from './isDomElement';

/**
 * Return the container. If it's a string, it is considered a
 * css selector and retrieves the first matching element. Otherwise
 * test if it validates that it's a correct DOMElement.
 *
 * @param {string|HTMLElement} selectorOrHTMLElement CSS Selector or container node.
 * @return {HTMLElement} Container node
 * @throws Error when the type is not correct
 */
function getContainerNode(
  selectorOrHTMLElement: string | HTMLElement
): HTMLElement {
  const isSelectorString = typeof selectorOrHTMLElement === 'string';
  const domElement = isSelectorString
    ? document.querySelector(selectorOrHTMLElement as string)
    : selectorOrHTMLElement;

  if (!isDomElement(domElement)) {
    let errorMessage = 'Container must be `string` or `HTMLElement`.';

    if (isSelectorString) {
      errorMessage += ` Unable to find ${selectorOrHTMLElement}`;
    }

    throw new Error(errorMessage);
  }

  return domElement;
}

export default getContainerNode;
