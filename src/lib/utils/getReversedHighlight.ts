import unescape from './unescape';

const getReversedHighlight = (attribute: string) => {
  const regexHasMark = /(<mark>.*?<\/mark>)/gi;
  const parts = unescape(attribute).split(regexHasMark);

  if (parts.length === 1) return attribute;

  return parts
    .reduce((acc: string[], curr) => {
      if (!curr.length) {
        acc.push(curr);
      } else if (regexHasMark.test(curr)) {
        acc.push(curr.replace(/(<\/mark>|<mark>)/g, ''));
      } else {
        const reversed = curr
          .split(/([^a-z0-9])/gi)
          .map(escaped =>
            /(^[a-z0-9]+$)/gi.test(escaped)
              ? `<mark>${escaped}</mark>`
              : escaped
          )
          .join('');

        acc.push(reversed);
      }

      return acc;
    }, [])
    .join('');
};

export default getReversedHighlight;
