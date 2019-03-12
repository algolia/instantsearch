function isDomElement(object) {
  return (
    object instanceof window.HTMLElement ||
    (Boolean(object) && object.nodeType > 0)
  );
}

export default isDomElement;
