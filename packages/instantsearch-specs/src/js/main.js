import './highlight';

const changeThemeSelect = document.getElementById('js-changeTheme');
const customThemeStyleSheet = document.getElementById('js-customTheme');
const localStorageTheme = localStorage.getItem('customTheme') || '';
const hoverClass = document.querySelectorAll('.js-hoverClass');

// Store current CSS theme in localStorage

customThemeStyleSheet.setAttribute('href', localStorageTheme);

if (changeThemeSelect) {
  changeThemeSelect.value = localStorageTheme;
  changeThemeSelect.addEventListener('change', () => {
    customThemeStyleSheet.setAttribute('href', changeThemeSelect.value);
    localStorage.setItem('customTheme', changeThemeSelect.value);
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
