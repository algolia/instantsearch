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
  changeThemeSelect.addEventListener('change', (e) => {
    customThemeStyleSheet.setAttribute(
      'href',
      changeThemeSelect.options[e.target.options.selectedIndex].value
    );
    localStorage.setItem('selectChoice', e.target.options.selectedIndex);
  });
}

// Hover list of classes to highligh them

function highlightMatches(item) {
  const queue = [document.getElementById('js-pre')];
  const word = item.getAttribute('data-value').replace(/\./g, '');
  let curr;

  while ((curr = queue.pop())) {
    if (curr.textContent.match(word)) {
      // eslint-disable-next-line no-loop-func
      curr.childNodes.forEach((currentNode) => {
        const currentTextContent = currentNode.textContent;
        const textWithoutQuotes = currentTextContent.substring(
          1,
          currentTextContent.length - 1
        );
        const arrFromText = textWithoutQuotes.split(' ');

        switch (currentNode.nodeType) {
          case Node.TEXT_NODE:
            if (arrFromText.indexOf(word) > -1) {
              curr.classList.toggle('highlighted-text');
            }
            break;
          case Node.ELEMENT_NODE:
            queue.push(currentNode);
            break;
          // No Default
        }
      });
    }
  }
}

hoverClass.forEach((item) => {
  item.addEventListener('mouseenter', () => {
    highlightMatches(item);
  });

  item.addEventListener('mouseleave', () => {
    highlightMatches(item);
  });
});

// Change HTML tabs

codeWrapperTabs.forEach((tab) => {
  const dataHTML = tab.getAttribute('data-html');

  tab.addEventListener('click', () => {
    codeWrapperTabs.forEach((_tab) => _tab.classList.remove('selected'));

    tab.classList.add('selected');

    document.querySelectorAll('.code-wrapper-content').forEach((content) => {
      const isActive = content.getAttribute('data-html') === dataHTML;

      content.style.display = isActive ? 'block' : 'none';
      content.parentNode.classList.toggle(
        'dark',
        isActive && content.querySelector('[class$="--dark"]')
      );
    });

    document.querySelectorAll('.code-output').forEach((output) => {
      output.style.display =
        output.getAttribute('data-html') === dataHTML ? 'block' : 'none';
    });
  });
});
