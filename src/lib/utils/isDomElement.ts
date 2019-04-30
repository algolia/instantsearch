function isDomElement(object: any): object is HTMLElement {
  return (
    object instanceof HTMLElement || (Boolean(object) && object.nodeType > 0)
  );
}

export default isDomElement;
