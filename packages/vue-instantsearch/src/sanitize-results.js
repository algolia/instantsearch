import escapeHtml from 'escape-html';

export default function sanitizeResults(
  results,
  safePreTag,
  safePostTag,
  preTag = '<em>',
  postTag = '</em>'
) {
  if (!Array.isArray(results)) {
    throw new TypeError('Results should be provided as an array.');
  }

  if (typeof safePreTag !== 'string' || typeof safePostTag !== 'string') {
    throw new TypeError(
      'safePreTag and safePostTag should be provided as strings.'
    );
  }

  const sanitized = [];
  for (const result of results) {
    if ('_highlightResult' in result) {
      result._highlightResult = sanitizeHighlights(
        result._highlightResult,
        safePreTag,
        safePostTag,
        preTag,
        postTag
      );
    }

    if ('_snippetResult' in result) {
      result._snippetResult = sanitizeHighlights(
        result._snippetResult,
        safePreTag,
        safePostTag,
        preTag,
        postTag
      );
    }

    sanitized.push(result);
  }

  return sanitized;
}

const sanitizeHighlights = function(
  data,
  safePreTag,
  safePostTag,
  preTag,
  postTag
) {
  if (containsValue(data)) {
    const sanitized = Object.assign({}, data, {
      value: escapeHtml(data.value)
        .replace(new RegExp(safePreTag, 'g'), preTag)
        .replace(new RegExp(safePostTag, 'g'), postTag),
    });

    return sanitized;
  }

  if (Array.isArray(data)) {
    const child = [];
    data.forEach(item => {
      child.push(
        sanitizeHighlights(item, safePreTag, safePostTag, preTag, postTag)
      );
    });

    return child;
  }

  if (isObject(data)) {
    const keys = Object.keys(data);
    const child = {};
    keys.forEach(key => {
      child[key] = sanitizeHighlights(
        data[key],
        safePreTag,
        safePostTag,
        preTag,
        postTag
      );
    });

    return child;
  }

  return data;
};

const containsValue = function(data) {
  return isObject(data) && 'matchLevel' in data && 'value' in data;
};

const isObject = value => typeof value === 'object' && value !== null;
