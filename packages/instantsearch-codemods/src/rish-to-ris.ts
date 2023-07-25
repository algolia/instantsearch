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

  replaceImports(
    j,
    source,
    'react-instantsearch-hooks-router-nextjs',
    'react-instantsearch-router-nextjs'
  );

  replaceImports(
    j,
    source,
    'react-instantsearch-hooks-server',
    'react-instantsearch'
  );

  return source.toSource(printOptions);
}
