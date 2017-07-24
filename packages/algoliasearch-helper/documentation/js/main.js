/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _sidebar = __webpack_require__(1);

	var _sidebar2 = _interopRequireDefault(_sidebar);

	var _javascripts = __webpack_require__(2);

	var algolia = _interopRequireWildcard(_javascripts);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.addEventListener('load', function () {
	  var header = new algolia.communityHeader();
	});

	var container = document.querySelector('.documentation-container');
	var sidebarContainer = document.querySelector('.sidebar');

	if (container && _sidebar2.default) {
	  (0, _sidebar2.default)({
	    headersContainer: container,
	    sidebarContainer: sidebarContainer,
	    headerStartLevel: 2
	  });
	}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = sidebar;

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function sidebar(options) {
	  var headersContainer = options.headersContainer,
	      sidebarContainer = options.sidebarContainer,
	      headerStartLevel = options.headerStartLevel;

	  listenToChanges(options);

	  var headers = headersContainer.querySelectorAll('h2, h3');
	  //const select = document.createElement('select');
	  var list = document.createElement('ul');
	  var startLevel = headerStartLevel; // we start at h2
	  list.classList.add('no-mobile');
	  var currentList = list;
	  var currentLevel = startLevel;

	  //select.addEventListener('change', e => window.location = e.target.value);
	  sidebarContainer.appendChild(list);
	  //sidebarContainer.appendChild(select);
	  sidebarFollowScroll(sidebarContainer.firstChild);
	  activeLinks(sidebarContainer);
	  scrollSpy(sidebarContainer, headersContainer);
	}

	function listenToChanges(originalParameters) {
	  var headersContainer = originalParameters.headersContainer,
	      sidebarContainer = originalParameters.sidebarContainer,
	      headerStartLevel = originalParameters.headerStartLevel;
	}

	function sidebarFollowScroll(sidebarContainer) {
	  var _getPositionsKeyEleme = getPositionsKeyElements(sidebarContainer),
	      height = _getPositionsKeyEleme.height,
	      navHeight = _getPositionsKeyEleme.navHeight,
	      footerHeight = _getPositionsKeyEleme.footerHeight,
	      menuHeight = _getPositionsKeyEleme.menuHeight,
	      sidebarTop = _getPositionsKeyEleme.sidebarTop;

	  var positionSidebar = function positionSidebar() {

	    var currentScroll = window.pageYOffset;
	    if (currentScroll > sidebarTop - navHeight) {
	      var fold = height - footerHeight - menuHeight - 50;
	      if (currentScroll > fold) {
	        sidebarContainer.style.top = fold - currentScroll + navHeight + 'px';
	      } else {
	        sidebarContainer.style.top = null;
	      }
	      sidebarContainer.classList.add('fixed');
	    } else {
	      sidebarContainer.classList.remove('fixed');
	    }
	  };

	  window.addEventListener('load', positionSidebar);
	  document.addEventListener('DOMContentLoaded', positionSidebar);
	  document.addEventListener('scroll', positionSidebar);
	}

	function scrollSpy(sidebarContainer, headersContainer) {
	  var headers = [].concat(_toConsumableArray(headersContainer.querySelectorAll('h2, h3')));

	  var setActiveSidebarLink = function setActiveSidebarLink(header) {
	    [].concat(_toConsumableArray(sidebarContainer.querySelectorAll('a'))).forEach(function (item) {
	      if (item.getAttribute('href').slice(1) === header.getAttribute('id')) {
	        item.classList.add('active');
	      } else {
	        item.classList.remove('active');
	      }
	    });
	  };

	  var findActiveSidebarLink = function findActiveSidebarLink() {
	    var highestVisibleHeaders = headers.map(function (header) {
	      return { element: header, rect: header.getBoundingClientRect() };
	    }).filter(function (_ref) {
	      var rect = _ref.rect;

	      // top element relative viewport position should be at least 1/3 viewport
	      // and element should be in viewport
	      return rect.top < window.innerHeight / 3 && rect.bottom < window.innerHeight;
	    })
	    // then we take the closest to this position as reference
	    .sort(function (header1, header2) {
	      return Math.abs(header1.rect.top) < Math.abs(header2.rect.top) ? -1 : 1;
	    });

	    if (highestVisibleHeaders.length === 0) {
	      setActiveSidebarLink(headers[0]);
	      return;
	    }

	    setActiveSidebarLink(highestVisibleHeaders[0].element);
	  };

	  findActiveSidebarLink();
	  window.addEventListener('load', findActiveSidebarLink);
	  document.addEventListener('DOMContentLoaded', findActiveSidebarLink);
	  document.addEventListener('scroll', findActiveSidebarLink);
	}

	// The Following code is used to set active items
	// On the documentation sidebar depending on the
	// clicked item
	function activeLinks(sidebarContainer) {
	  var linksContainer = sidebarContainer.querySelector('ul');

	  linksContainer.addEventListener('click', function (e) {
	    if (e.target.tagName === 'A') {
	      [].concat(_toConsumableArray(linksContainer.querySelectorAll('a'))).forEach(function (item) {
	        return item.classList.remove('active');
	      });
	      e.target.classList.add('active');
	    }
	  });
	}

	function getPositionsKeyElements(sidebar) {
	  var sidebarBBox = sidebar.getBoundingClientRect();
	  var bodyBBox = document.body.getBoundingClientRect();
	  var sidebarTop = sidebarBBox.top - bodyBBox.top;
	  var footer = document.querySelector('.ac-footer');
	  var navigation = document.querySelector('.ac-nav');
	  var menu = document.querySelector('.sidebar > ul');
	  var height = document.querySelector('html').getBoundingClientRect().height;
	  var navHeight = navigation.offsetHeight;
	  var footerHeight = footer.offsetHeight;
	  var menuHeight = menu.offsetHeight;

	  return { sidebarTop: sidebarTop, height: height, navHeight: navHeight, footerHeight: footerHeight, menuHeight: menuHeight };
	}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	const javascripts = {
	  communityHeader: __webpack_require__(3)
	}

	module.exports = javascripts;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/**
	 * Main header function with docsearch
	 * @param  {Object} docSearch config
	 */

	class communityHeader {

	  constructor(docSearchCredentials, docSearch) {
	    this.docSearchCredentials = docSearchCredentials;
	    this.docSearch = docSearch || null;

	    this.menuState = {
	      isOpen: false,
	      isOpenMobile: false
	    }

	    this.INIT_VAL = {
	      WIDTH: 490,
	      HEIGHT: 360
	    }

	    this.disableTransitionTimeout;

	    this.searchIcon = document.querySelector('#search');
	    this.cancelIcon = document.querySelector('#cancel');
	    this.searchInputContainer = document.querySelector('.algc-search__input');
	    this.searchContainer = this.searchInputContainer ? this.searchInputContainer.parentNode : null;
	    this.navRoot = document.querySelector('.algc-dropdownroot');
	    this.dropdownRoot = document.querySelector('.algc-navigation__dropdown-holder');
	    this.navItems = document.querySelectorAll('a[data-enabledropdown="true"]');
	    this.navContainer = document.querySelector('.algc-dropdownroot__dropdowncontainer');
	    this.menuContainer = document.querySelector('.algc-navigation__container');
	    this.navBg = document.querySelector('.algc-dropdownroot__dropdownbg');
	    this.navArrow = document.querySelector('.algc-dropdownroot__dropdownarrow');
	    this.dropDownContainer = document.querySelector('.algc-dropdownroot__dropdowncontainer');
	    this.menuTriggers = document.querySelectorAll('[data-enabledropdown="true"]');
	    this.mobileMenuButton = document.querySelector('.algc-openmobile ');
	    this.mobileMenu = document.querySelector('.algc-mobilemenu');
	    this.subList = document.querySelectorAll('.algc-menu--sublistlink');
	    this.subListHolders = [...this.subList].map(node => node.parentNode);
	    this.menuDropdowns = {};

	    [].forEach.call(document.querySelectorAll('[data-dropdown-content]'), (item) => {
	      this.menuDropdowns[item.dataset.dropdownContent] = {
	        parent: item.parentNode,
	        content: item
	      }
	    });

	    this.shouldInitDocSearch = this.shouldInitDocSearch.bind(this);
	    this.docSearchInit = this.checkDocSearch(docSearch);
	    this.enableDocSearch = this.verifyDocSearchParams(docSearchCredentials);
	    this.hasDocSearchRendered = document.querySelector('.algc-navigation .algc-search__input--docsearch');
	    this.triggerMenu = this.triggerMenu.bind(this);
	    this.shouldTriggerMenu = this.shouldTriggerMenu.bind(this);
	    this.closeMenu = this.closeMenu.bind(this);
	    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
	    this.docSearchToggling = this.docSearchToggling.bind(this);
	    this.initDocSearchStrategy = this.initDocSearchStrategy.bind(this);
	    this.openSublist = this.openSublist.bind(this);
	    this.closeSubLists = this.closeSubLists.bind(this);
	    this.bindListeners = this.bindListeners.bind(this);

	    this.calculatePosition = this.calculatePosition.bind(this);

	    this.verifyDocSearchParams();
	    this.shouldInitDocSearch();
	    this.initDocSearchStrategy();
	    this.bindListeners();
	  }

	  calculatePosition(sourceNode) {
	    const box = sourceNode.getBoundingClientRect();
	    const realWidth = sourceNode.offsetWidth;
	    const realHeight = sourceNode.offsetHeight;

	    return {
	      left: box.left,
	      top: box.top,
	      width: box.width,
	      height: box.height,
	      realWidth: realWidth,
	      realHeight: realHeight,
	      center: box.left + box.width / 2
	    }
	  }

	  shouldInitDocSearch() {
	    if (!this.enableDocSearch && this.hasDocSearchRendered) {
	      throw new Error('You need to pass docSearch: { apiKey, indexName, inputSelector } to communityHeader function in order to initialise docSearch');
	    }
	  }

	  checkDocSearch(docSearch = false) {
	    if (docSearch) return docSearch;

	    if (typeof window.docsearch === "function" || typeof docsearch === "function") {
	      return docsearch;
	    }
	  }

	  verifyDocSearchParams(docSearchCredentials) {
	    return (docSearchCredentials &&
	      docSearchCredentials.apiKey &&
	      docSearchCredentials.indexName &&
	      docSearchCredentials.inputSelector) ? true : false;
	  }

	  triggerMenu(event) {

	    const dropdown = event.target.dataset.dropdown;
	    const newTarget = this.menuDropdowns[dropdown].content;
	    const newContent = this.menuDropdowns[dropdown].parent;

	    const navItem = this.calculatePosition(event.target);
	    const newTargetCoordinates = this.calculatePosition(newTarget);
	    const menuContainerOffset = this.calculatePosition(this.menuContainer);
	    let leftDistance;

	    const scaleFactors = {
	      X: newTargetCoordinates.realWidth / this.INIT_VAL.WIDTH,
	      Y: newTargetCoordinates.realHeight / this.INIT_VAL.HEIGHT
	    }

	    leftDistance = (navItem.center - menuContainerOffset.left) + "px";

	    if(menuContainerOffset.left < 20){
	      leftDistance = "calc(50% - 36px)"
	    }

	    this.navBg.style.cssText = `
	      transform: translateX(${leftDistance}) scale(${scaleFactors.X}, ${scaleFactors.Y})`;

	    this.navArrow.style.cssText = `
	      transform: translateX(${leftDistance}) rotate(45deg)`;

	    this.dropDownContainer.style.cssText = `
	      transform: translateX(${leftDistance});
	      width: ${newTargetCoordinates.realWidth}px;
	      height: ${newTargetCoordinates.realHeight + 10}px;`;

	    this.dropdownRoot.style.pointerEvents = "auto";

	    Object.keys(this.menuDropdowns).forEach(key => {
	      if (key === dropdown) {
	        this.menuDropdowns[key].parent.classList.add('active');
	      } else {
	        this.menuDropdowns[key].parent.classList.remove('active');
	      }
	    })

	    if (!this.menuState.isOpen) {
	      setTimeout(() => {
	        this.navRoot.className = "algc-dropdownroot activeDropdown";
	      }, 50);
	    }

	    window.clearTimeout(this.disableTransitionTimeout);
	    this.menuState.isOpen = true;
	  }

	  shouldTriggerMenu(event) {
	    if(this.menuState.isOpen) { 
	      this.triggerMenu(event);
	    } else {
	      this.triggerMenuTimeout = setTimeout(()=>{
	        this.triggerMenu(event);
	      }, 200);
	    }
	  }

	  closeMenu(event) {
	    window.clearTimeout(this.triggerMenuTimeout);
	    this.menuState.isOpen = false;
	    this.disableTransitionTimeout = setTimeout(() => {
	      this.dropdownRoot.style.pointerEvents = "none";
	      this.navRoot.className = "algc-dropdownroot notransition"
	    }, 50);
	  }

	  toggleMobileMenu(event) {
	    this.mobileMenuButton.classList.toggle('algc-openmobile--open');
	    this.mobileMenu.classList.toggle('algc-mobilemenu--open');
	  }

	  // Search
	  docSearchToggling() {
	    this.searchInput = document.querySelector(this.docSearchCredentials.inputSelector);
	    const openSearchInput = () => {
	      this.searchContainer.classList.add('open');
	      this.searchInput.focus();
	    }

	    const closeSearchInput = () => {
	      this.searchInput.blur();
	      this.searchContainer.classList.remove('open');
	    }

	    const emptySearchInput = () => {
	      if (this.searchInput.value !== '') {
	        this.searchInput.value = '';
	      } else {
	        closeSearchInput();
	      }
	    }
	    this.searchInput.setAttribute('value', '');
	    this.searchIcon.addEventListener('click', openSearchInput);
	    this.cancelIcon.addEventListener('click', emptySearchInput);
	  };

	  initDocSearch() {
	    this.docSearchToggling();
	    this.docSearchInit(this.docSearchCredentials);
	  }

	  initDocSearchStrategy() {
	    if (this.enableDocSearch && typeof this.docSearchInit === "function") {
	      this.initDocSearch();

	    } else if (this.docSearch === "lazy") {

	      const docSearchScript = document.createElement('script');
	      docSearchScript.type = 'text/javascript';
	      docSearchScript.async = true;
	      document.body.appendChild(docSearchScript);

	      docSearchScript.onload = () => {
	        this.docSearchInit = docsearch;
	        this.initDocSearch();
	      };

	      docSearchScript.src = "https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.js";
	    }
	  }

	  openSublist(node) {
	    const parent = node.parentNode;
	    this.subListHolders.forEach(holder => {
	      if (holder === parent && !parent.classList.contains('open')) {
	        holder.classList.add('open');
	      } else {
	        holder.classList.remove('open');
	      }
	    })
	  }

	  closeSubLists(event) {
	    this.subListHolders.forEach(holder => holder.classList.remove('open'));
	  }

	  bindListeners() {
	    var that = this;
	    this.subList.forEach(link => {
	      link.addEventListener('click', function(event){
	        event.preventDefault();
	        event.stopPropagation();
	        that.openSublist(this);
	      });
	    });

	    this.menuTriggers.forEach(item => {
	      item.addEventListener('mouseenter', this.shouldTriggerMenu);
	      item.addEventListener('focus', this.triggerMenu);
	    });

	    this.navItems.forEach(item => {
	      item.addEventListener('mouseleave', this.closeMenu);
	    });

	    this.navContainer.addEventListener('mouseenter', () => {
	      clearTimeout(this.disableTransitionTimeout);
	    });

	    this.mobileMenuButton.addEventListener('click', this.toggleMobileMenu);
	    document.addEventListener('click', this.closeSubLists);
	    document.querySelector('.algc-dropdownroot__dropdowncontainer').addEventListener('mouseleave', this.closeMenu);
	  }
	}

	module.exports = communityHeader


/***/ })
/******/ ]);