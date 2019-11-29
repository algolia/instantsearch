import { Widget } from '../../src/types';

const setDisabledState = (element: HTMLButtonElement, state: boolean) => {
  element.disabled = state;
  element.classList.toggle('ais-ClearRefinements-button--disabled');
};

export const withLifecycle = (
  search: any,
  container: HTMLElement,
  fn: (node: HTMLElement) => Widget
) => {
  const actions = document.createElement('div');
  actions.style.marginBottom = '15px';
  actions.style.paddingBottom = '15px';
  actions.style.borderBottom = '1px solid #e4e4e4';

  const description = document.createElement('p');
  description.textContent =
    'Click on one of the button to add/remove the widget.';

  const add = document.createElement('button');
  add.style.marginRight = '10px';
  add.className = 'ais-ClearRefinements-button';
  add.textContent = 'Add widget';

  const remove = document.createElement('button');
  remove.className = 'ais-ClearRefinements-button';
  remove.textContent = 'Remove widget';

  const node = document.createElement('div');

  actions.appendChild(description);
  actions.appendChild(add);
  actions.appendChild(remove);

  container.appendChild(actions);
  container.appendChild(node);

  const widget = fn(node);

  search.addWidgets([widget]);
  setDisabledState(add, true);

  add.addEventListener('click', () => {
    search.addWidgets([widget]);
    setDisabledState(add, true);
    setDisabledState(remove, false);
  });

  remove.addEventListener('click', () => {
    search.removeWidgets([widget]);
    setDisabledState(add, false);
    setDisabledState(remove, true);
  });
};
