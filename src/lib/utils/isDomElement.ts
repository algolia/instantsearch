function isDomElement(object: any): object is HTMLElement {
  return (
    // @ts-ignore
    object instanceof window.HTMLElement ||
    (Boolean(object) && object.nodeType > 0)
  );
}

export default isDomElement;
