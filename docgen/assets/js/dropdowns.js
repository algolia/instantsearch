function dropdowns() {
  const openDropdown = document.querySelectorAll('[data-toggle-dropdown]');
  const otherDropdown = document.querySelectorAll('.simple-dropdown');

  for (let i = 0; i < openDropdown.length; i++) {
    toggleDropdown(openDropdown[i]);
  }

  function toggleDropdown(element) {
    const dropdown = element.getAttribute('data-toggle-dropdown');
    const theDropdown = document.getElementById(dropdown);
    element.addEventListener('click', () => {
      if (!theDropdown.classList.contains('opened')) {
        for (let i = 0; i < otherDropdown.length; i++) {
          otherDropdown[i].classList.remove('opened');
        }

        theDropdown.classList.add('opened');
        theDropdown.setAttribute('aria-expanded', 'true');
        theDropdown.setAttribute('aria-expanded', 'true');
      } else {
        theDropdown.classList.remove('opened');
        theDropdown.setAttribute('aria-expanded', 'false');
        theDropdown.setAttribute('aria-expanded', 'false');
      }
    });

    // When there is a click event
    // Check if the clicked element is the
    // dropdown toggler, if not, close the dropdown
    document.body.addEventListener('click', e => {
      if (e.target !== element) {
        theDropdown.classList.remove('opened');
      }
    });
  }
}

export default dropdowns;
