import './highlight';

docsearch({
  apiKey: 'e0cad4d028f0c3aa772c62952ed754cb',
  indexName: 'instantsearch_specs',
  inputSelector: '#docsearch',
  debug: false, // Set debug to true if you want to inspect the dropdown
});

const changeThemeSelect = document.getElementById('js-changeTheme');
const customThemeStyleSheet = document.getElementById('js-customTheme');
const localStorageSelectChoice = localStorage.getItem('selectChoice') || 0;
const hoverClass = document.querySelectorAll('.js-hoverClass');
const codeWrapperTabs = document.querySelectorAll('.code-wrapper-tab');

// Store current CSS theme in localStorage

customThemeStyleSheet.setAttribute(
  'href',
  changeThemeSelect.options[localStorageSelectChoice].value
);

if (changeThemeSelect) {
  changeThemeSelect.value =
    changeThemeSelect.options[localStorageSelectChoice].value;
  changeThemeSelect.addEventListener('change', e => {
    customThemeStyleSheet.setAttribute(
      'href',
      changeThemeSelect.options[e.target.options.selectedIndex].value
    );
    localStorage.setItem('selectChoice', e.target.options.selectedIndex);
  });
}

// Hover list of classes to highligh them

function targetHtmlElement(item) {
  const queue = [document.getElementById('js-pre')];
  const word = item.getAttribute('data-value').replace(/\./g, '');
  let curr;
  while ((curr = queue.pop())) {
    if (!curr.textContent.match(word)) continue;
    curr.childNodes.forEach(currentNode => {
      const currentTextContent = currentNode.textContent;
      const textWithoutQuotes = currentTextContent.substring(
        1,
        currentTextContent.length - 1
      );
      const ArrFromText = textWithoutQuotes.split(' ');
      switch (currentNode.nodeType) {
        case Node.TEXT_NODE:
          if (ArrFromText.indexOf(word) > -1) {
            curr.classList.toggle('highlighted-text');
          }
          break;
        case Node.ELEMENT_NODE:
          queue.push(currentNode);
          break;
      }
    });
  }
}

hoverClass.forEach(item => {
  item.addEventListener('mouseenter', () => {
    targetHtmlElement(item);
  });
  item.addEventListener('mouseleave', () => {
    targetHtmlElement(item);
  });
});

// Change HTML tabs

codeWrapperTabs.forEach(item => {
  const dataHTML = item.getAttribute('data-html');
  item.addEventListener('click', () => {
    codeWrapperTabs.forEach(item => {
      item.classList.remove('selected');
    });
    item.classList.add('selected');
    document.querySelectorAll('.code-wrapper-content').forEach(item => {
      if (item.getAttribute('data-html') === dataHTML) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
    document.querySelectorAll('.code-output').forEach(item => {
      if (item.getAttribute('data-html') === dataHTML) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
});
