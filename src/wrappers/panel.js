import { getContainerNode, renderTemplate } from '../lib/utils';
import { component } from '../lib/suit.js';
import cx from 'classnames';
import defaultTemplates from './defaultTemplates';

export default widgetFactory => optionsWithPanelOpts => {
  const {
    container,
    cssClasses,
    templates = {},
    collapsible,
  } = optionsWithPanelOpts;

  const allTemplates = {
    ...defaultTemplates,
    ...templates,
  };

  const panelBodyContainer = renderPanel({
    container: getContainerNode(container),
    cssClasses,
    templates: allTemplates,
    collapsible,
  });

  const widget = widgetFactory({
    ...optionsWithPanelOpts,
    container: panelBodyContainer,
    templates: {
      ...optionsWithPanelOpts.templates,
      header: undefined,
      footer: undefined,
      collapseButton: undefined,
    },
  });

  return {
    getConfiguration: opts =>
      widget.getConfiguration ? widget.getConfiguration(opts) : {},
    init: opts => {
      widget.init(opts);
    },
    render: opts => {
      // update DOM
      widget.render(opts);
    },
    // forward routing specific methods
  };
};

const suitPanel = component('Panel');

function renderPanel({
  container,
  cssClasses = {},
  templates = {},
  collapsible,
}) {
  const rootClassnames = cx(suitPanel(), cssClasses.panelRoot, {
    [suitPanel({ modifierName: 'collapsible' })]: collapsible,
  });

  const bodyClassnames = cx(
    suitPanel({ descendantName: 'body' }),
    cssClasses.panelBody
  );

  const root = document.createElement('div');
  root.classList = rootClassnames;

  if (templates.header) {
    const headerClassnames = cx(
      suitPanel({ descendantName: 'header' }),
      cssClasses.panelRoot
    );
    const header = document.createElement('div');
    header.innerHTML = renderTemplate({
      templateKey: 'header',
      templates,
    });
    header.classList = headerClassnames;
    root.appendChild(header);
  }

  if (collapsible) {
    const buttonClassnames = cx(
      suitPanel({ descendantName: 'collapseButton' }),
      cssClasses.collapseButton
    );
    const button = document.createElement('button');
    button.innerHTML = renderTemplate({
      templateKey: 'collapseButton',
      templates,
    });
    button.classList = buttonClassnames;
    root.appendChild(button);
  }

  const body = document.createElement('div');
  body.classList = bodyClassnames;
  root.appendChild(body);

  if (templates.footer) {
    const footerClassnames = cx(
      suitPanel({ descendantName: 'footer' }),
      cssClasses.panelRoot
    );
    const footer = document.createElement('div');
    footer.innerHTML = renderTemplate({
      templateKey: 'footer',
      templates,
    });
    footer.classList = footerClassnames;
    root.appendChild(footer);
  }

  container.appendChild(root);

  return body;
}
