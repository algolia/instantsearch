function dropdowns() {

  const openDropdown = document.querySelectorAll('[data-toggle-dropdown]');
  const otherDropdown = document.querySelectorAll('.simple-dropdown');

  for (let i = 0; i < openDropdown.length; i++) {
    toggleDropdown(openDropdown[i]);
  }

  function toggleDropdown(element) {
    const dropdown = element.getAttribute('data-toggle-dropdown');
    element.addEventListener('click', function() {
      if (!document.getElementById(dropdown).classList.contains('opened')) {
        for (let i = 0; i < otherDropdown.length; i++) {
          otherDropdown[i].classList.remove('opened');
        }

        document.getElementById(dropdown).classList.add('opened');
        document.getElementById(dropdown).setAttribute('aria-expanded', 'true');
        this.setAttribute('aria-expanded', 'true');
      } else {
        document.getElementById(dropdown).classList.remove('opened');
        document.getElementById(dropdown).setAttribute('aria-expanded', 'false');
        this.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

dropdowns();
