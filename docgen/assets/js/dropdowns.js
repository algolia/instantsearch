function dropdowns() {

  var openDropdown = document.querySelectorAll('[data-toggle-dropdown]');
  var otherDropdown = document.querySelectorAll('.simple-dropdown');

  for (var i = 0; i < openDropdown.length; i++) {
    toggleDropdown(openDropdown[i])
  }

  function toggleDropdown(element) {
    var dropdown = element.getAttribute('data-toggle-dropdown');
    element.addEventListener('click', function() {
      if (!document.getElementById(dropdown).classList.contains('opened')) {
        for (var i = 0; i < otherDropdown.length; i++) {
          otherDropdown[i].classList.remove('opened')
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
  };
}

dropdowns();