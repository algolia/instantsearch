if (document.querySelector('.documentation-container')) {
  const $edit = document.createElement('a');
  $edit.classList.add('editThisPage');
  $edit.textContent = 'Edit this page';

  let href = 'https://github.com/algolia/react-instantsearch/edit/master/';
  const doc = 'docgen/src';
  const api = 'packages/react-instantsearch/src';

  let pathname = document.location.pathname.replace('/react-instantsearch', '');

  if (/^\/(?:widgets|connectors)\/.+/.test(pathname)) {
    href += `${api}${pathname.replace('.html', '.js')}`;
    if (pathname === '/widgets/InstantSearch.html') {
      href = href.replace('/widgets/', '/core/');
    }
  } else {
    if (/\/$/.test(pathname)) pathname += 'index.html';
    href += `${doc}${pathname.replace('.html', '.md')}`;
  }

  pathname = pathname.replace('.html', '.md');
  $edit.href = href;
  document.querySelector('.documentation-container').appendChild($edit);
}
