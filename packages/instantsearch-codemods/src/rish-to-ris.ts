import { replaceImports } from './replaceImports';

import type { API, FileInfo, Options } from 'jscodeshift';

export default function transformer(
  file: FileInfo,
  { jscodeshift: j }: API,
  options: Options
) {
  const source = j(file.source);
  const printOptions = options.printOptions || {
    quote: 'single',
  };

  replaceImports(
    j,
    source,
    'react-instantsearch-hooks',
    'react-instantsearch-core'
  );
  replaceImports(
    j,
    source,
    'react-instantsearch-hooks-web',
    'react-instantsearch'
  );

  return source.toSource(printOptions);
}
