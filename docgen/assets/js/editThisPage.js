if (document.querySelector('.documentation-container')) {
  const $edit = document.createElement('a');
  $edit.classList.add('editThisPage');
  $edit.textContent = 'Edit this page';

  let href = 'https://github.com/algolia/react-instantsearch/edit/master/';
  const doc = 'docgen/src';
  const apiCore = 'packages/react-instantsearch-core/src';
  const apiDom = 'packages/react-instantsearch-dom/src';

  let pathname = document.location.pathname.replace('/react-instantsearch', '');

  // Special case for the GeoSearch
  if (/^\/(?:widgets\/GeoSearch).+/.test(pathname)) {
    href += '/docgen/src/widgets/GeoSearch.md';
  } else if (/^\/(?:widgets)\/.+/.test(pathname)) {
    href += `${apiDom}${pathname.replace('.html', '.js')}`;

    const instantsearchEncoded = encodeURIComponent('<InstantSearch>');
    const indexEncoded = encodeURIComponent('<Index>');

    if (pathname === `/widgets/${instantsearchEncoded}.html`) {
      href = href.replace(
        `/react-instantsearch-dom/src/widgets/${instantsearchEncoded}`,
        '/react-instantsearch-core/src/components/InstantSearch'
      );
    }

    if (pathname === `/widgets/${indexEncoded}.html`) {
      href = href.replace(
        `/react-instantsearch-dom/src/widgets/${indexEncoded}`,
        '/react-instantsearch-core/src/components/Index'
      );
    }
  } else if (/^\/(?:connectors)\/.+/.test(pathname)) {
    href += `${apiCore}${pathname.replace('.html', '.js')}`;
  } else if (/^\/(?:server-side-renderings)\/.+/.test(pathname)) {
    href += `${apiDom}/core/findResultsState.js`;
  } else {
    if (/\/$/.test(pathname)) pathname += 'index.html';
    href += `${doc}${pathname.replace('.html', '.md')}`;
  }

  pathname = pathname.replace('.html', '.md');
  $edit.href = href;
  document.querySelector('.documentation-container').appendChild($edit);
}
