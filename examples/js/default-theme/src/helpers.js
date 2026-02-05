import { connectSearchBox } from 'instantsearch.js/es/connectors';

export function createTabsWidget({ container, tabs }) {
  const containerElement =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!containerElement) {
    throw new Error(`Container not found: ${container}`);
  }

  let currentTab = 0;
  const widgetContainers = [];
  const secondaryWidgetContainers = [];

  const tabsWrapper = document.createElement('div');
  tabsWrapper.className = 'Tabs';

  const tabsHeader = document.createElement('div');
  tabsHeader.className = 'Tabs-header';
  tabsHeader.setAttribute('role', 'tablist');

  const tabsList = document.createElement('div');
  tabsList.className = 'Tabs-list';

  tabs.forEach((tab, index) => {
    const button = document.createElement('button');
    button.className = `Tabs-title${index === 0 ? ' Tabs-title--active' : ''}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('aria-controls', `tab-${index}-item`);
    button.setAttribute('id', `tab-${index}-title`);
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');
    button.textContent = tab.title;

    button.addEventListener('click', () => {
      currentTab = index;
      updateTabs();
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        currentTab = Math.max(0, currentTab - 1);
        updateTabs();
        tabsHeader.children[currentTab].focus();
      } else if (event.key === 'ArrowRight') {
        currentTab = Math.min(currentTab + 1, tabs.length - 1);
        updateTabs();
        tabsHeader.children[currentTab].focus();
      }
    });

    tabsHeader.appendChild(button);

    const contentContainer = document.createElement('div');
    contentContainer.setAttribute('role', 'tabpanel');
    contentContainer.setAttribute('id', `tab-${index}-item`);
    contentContainer.setAttribute('aria-labelledby', `tab-${index}-title`);
    contentContainer.setAttribute('tabindex', '0');
    contentContainer.hidden = index !== 0;

    const widgetContainer = document.createElement('div');
    widgetContainers.push(widgetContainer);
    contentContainer.appendChild(widgetContainer);

    if (tab.secondaryWidgetFactory) {
      const secondaryContainer = document.createElement('div');
      secondaryWidgetContainers.push(secondaryContainer);
      contentContainer.appendChild(secondaryContainer);
    } else {
      secondaryWidgetContainers.push(null);
    }

    tabsList.appendChild(contentContainer);
  });

  tabsWrapper.appendChild(tabsHeader);
  tabsWrapper.appendChild(tabsList);
  containerElement.appendChild(tabsWrapper);

  function updateTabs() {
    Array.from(tabsHeader.children).forEach((button, index) => {
      const isActive = index === currentTab;
      button.className = `Tabs-title${isActive ? ' Tabs-title--active' : ''}`;
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    Array.from(tabsList.children).forEach((content, index) => {
      content.hidden = index !== currentTab;
    });
  }

  const widgets = [];
  tabs.forEach((tab, index) => {
    const widget = tab.widgetFactory(widgetContainers[index]);
    widgets.push(widget);

    if (tab.secondaryWidgetFactory) {
      const secondaryWidget = tab.secondaryWidgetFactory(
        secondaryWidgetContainers[index]
      );
      widgets.push(secondaryWidget);
    }
  });

  return {
    $$type: 'custom.tabs',
    init({ instantSearchInstance }) {
      instantSearchInstance.addWidgets(widgets);
    },
    dispose({ instantSearchInstance }) {
      instantSearchInstance.removeWidgets(widgets);
      containerElement.innerHTML = '';
    },
  };
}

export function createRefreshButton({ container }) {
  const customRefreshButton = connectSearchBox(
    (renderOptions, isFirstRender) => {
      const { instantSearchInstance } = renderOptions;

      if (isFirstRender) {
        const containerElement =
          typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!containerElement) {
          throw new Error(`Container not found: ${container}`);
        }

        const button = document.createElement('button');
        button.className = 'Refresh';
        button.type = 'button';
        button.innerHTML = `
        <svg
          fill="none"
          viewBox="0 0 24 24"
          style="width: 1rem; height: 1rem;"
          stroke="currentColor"
          stroke-width="2"
        >
          <title>Refresh the search results</title>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      `;

        button.addEventListener('click', () => {
          instantSearchInstance.refresh();
        });

        containerElement.appendChild(button);
      }
    }
  );

  return customRefreshButton();
}
