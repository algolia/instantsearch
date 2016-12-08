export default function initHeader() {
  const cmSearch = function () {
    const searchIcon = document.querySelector('#search');
    const cancelIcon = document.querySelector('#cancel');
    const searchContainer = document.querySelector('.cm-search__input');
    const searchInput = document.querySelector('#searchbox');

    function openSearchInput () {
      searchContainer.classList.add('open');
      searchInput.focus();
    }

    function closeSearchInput () {
      searchContainer.classList.remove('open');
    }

    function emptySearchInput () {
      if (searchInput.value !== '') {
        searchInput.value = '';
      } else {
        closeSearchInput();
      }
    }

    searchIcon.addEventListener('click', openSearchInput);
    cancelIcon.addEventListener('click', emptySearchInput);

    window.onresize = function () {
      emptySearchInput();
      closeSearchInput();
    };

    return cmSearch;
  };

  const toggleMobileMenu = function(args) {
    const trigger = args.trigger || '#open-menu';
    let opened = false;
    const target = args.target || '.cm-navigation__menu';
    const openedClass = args.openedClass || 'opened';

    document.querySelector(trigger).addEventListener('click', toggleMenu);

    function toggleMenu() {
      /* eslint-disable no-undef */
      docsearch({
        apiKey: '5cb6763f264e31381e18639a1147634c',
        indexName: 'react-instantsearch',
        inputSelector: '#mobile-searchbox',
        debug: true,
      });

      if (document.body.clientWidth < 768) {
        if (opened === false) {
          opened = true;
          document.querySelector('#menu-wrapper').classList.add(openedClass);
        } else {
          opened = false;
          document.querySelector('#menu-wrapper').classList.remove(openedClass);
        }
      } else if (opened === false) {
        opened = true;
        document.querySelector(target).classList.add(openedClass);
      } else {
        opened = false;
        document.querySelector(target).classList.remove(openedClass);
      }

      const cancelIconMobile = document.querySelector('#cancel-mobile');
      cancelIconMobile.addEventListener('click', mobileSearchBla);

      function mobileSearchBla() {
        document.querySelector('#searchbox-mobile').value = '';
      }
    }
  };

  function wrapMenuOnMobile() {
    const container = document.querySelector('.cm-navigation');
    const wrapper = document.createElement('div');
    wrapper.id = 'menu-wrapper';
    wrapper.classList.add('cm-navigation__menu');
    wrapper.classList.add('mobile-navigation-wrapper');
    const innerMenu = document.querySelector('.cm-navigation__menu').innerHTML;

    if (!document.getElementById('menu-wrapper')) {
      wrapper.innerHTML = innerMenu;

      container.appendChild(wrapper);
      setTimeout(() => {
        document.querySelector('#menu-wrapper .cm-menu__list:first-of-type').style.display = 'none';
        const links = document.querySelectorAll('#menu-wrapper a');
        const linksArray = [];
        let linksTpl = '';
        const inm = document.querySelector('.mobile-navigation-wrapper input');
        const searchButton = document.querySelector('.mobile-navigation-wrapper button#search');
        const cancelButton = document.querySelector('.mobile-navigation-wrapper button#cancel');
        inm.id = 'mobile-searchbox';
        searchButton.id = 'search-mobile';
        cancelButton.id = 'cancel-mobile';

        links.forEach(e => {
          if (e.getAttribute('data-link')) {
            linksArray.push({
              link: e.href,
              name: e.textContent,
            });
          }
        });

        linksArray.forEach(e => {
          linksTpl += `<li class="cm-menu__list__item"><a href="${e.link}">${e.name}</a></li>`;
        });
        wrapper.innerHTML += `<ul class="cm-menu__list">${linksTpl}</ul>`;
      });
    }
  }

  function displayDropdown() {
    let active = false;
    const trigger = document.querySelector('.cm-navigation__brands--community');
    document.querySelector('body').addEventListener('click', () => {
      if (active) {
        toggle();
      }
    });

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      toggle();
    });

    function toggle() {
      active = !active;
      trigger.classList.toggle('dropdownActive');
    }
  }

  // If the user type :"s" or "/", open the searchbox
  function catchCmdF() {
    let keyPressed = {};

    document.addEventListener('keydown', e => {
      keyPressed[e.keyCode] = true;
    }, false);
    document.addEventListener('keyup', e => {
      keyPressed[e.keyCode] = false;
    }, false);

    function searchLoop() {
      if (keyPressed['83'] || keyPressed['191']) {
        document.querySelector('.cm-search__input').classList.add('open');
        document.querySelector('#searchbox').focus();

        setTimeout(() => {
          keyPressed = {};
        }, 500);
      } else if (keyPressed['27']) {
        document.querySelector('.cm-search__input').classList.remove('open');
        document.querySelector('#searchbox').blur();

        setTimeout(() => {
          keyPressed = {};
        }, 500);
      }
      setTimeout(searchLoop, 5);
    }

    searchLoop();
  }

  window.addEventListener('DOMContentLoaded', () => {
    cmSearch();
    toggleMobileMenu({
      trigger: '#open-menu',
    });

    wrapMenuOnMobile();
    displayDropdown();
    catchCmdF();
  });

  window.addEventListener('resize', () => {
    if (document.body.clientWidth < 768) {
      wrapMenuOnMobile();
    }
  });
}
