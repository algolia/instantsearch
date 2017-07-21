import escapeHtml from 'escape-html';

export default function(results, preTag, postTag, tagName = 'em') {
  if (!Array.isArray(results)) {
    throw new TypeError('Results should be provided as an array.');
  }

  if (typeof preTag !== 'string' || typeof postTag !== 'string') {
    throw new TypeError('preTag and postTag should be provided as strings.');
  }

  const sanitized = [];
  for (const result of results) {
    if ('_highlightResult' in result) {
      result._highlightResult = sanitizeHighlights(
        result._highlightResult,
        preTag,
        postTag,
        tagName
      );
    }

    if ('_snippetResult' in result) {
      result._snippetResult = sanitizeHighlights(
        result._snippetResult,
        preTag,
        postTag,
        tagName
      );
    }

    sanitized.push(result);
  }

  return sanitized;
}

const sanitizeHighlights = function(data, preTag, postTag, tagName) {
  if (containsValue(data)) {
    const sanitized = Object.assign({}, data, {
      value: escapeHtml(data.value)
        .replace(new RegExp(preTag, 'g'), `<${tagName}>`)
        .replace(new RegExp(postTag, 'g'), `</${tagName}>`),
    });

    return sanitized;
  }

  if (Array.isArray(data)) {
    const child = [];
    data.forEach(item => {
      child.push(sanitizeHighlights(item, preTag, postTag, tagName));
    });

    return child;
  }

  if (isObject(data)) {
    const keys = Object.keys(data);
    const child = {};
    keys.forEach(key => {
      child[key] = sanitizeHighlights(data[key], preTag, postTag, tagName);
    });

    return child;
  }

  return data;
};

const containsValue = function(data) {
  return isObject(data) && 'matchLevel' in data && 'value' in data;
};

const isObject = value => typeof value === 'object' && value !== null;
