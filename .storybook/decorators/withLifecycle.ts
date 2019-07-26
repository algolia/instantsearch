import { Widget } from '../../src/types';

const setDisabledState = (element: HTMLButtonElement, state: boolean) => {
  element.disabled = state;
  if (state) {
    element.classList.add('ais-ClearRefinements-button--disabled');
  } else {
    element.classList.remove('ais-ClearRefinements-button--disabled');
  }
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
  remove.style.marginRight = '10px';
  remove.className = 'ais-ClearRefinements-button';
  remove.textContent = 'Remove widget';

  const dispose = document.createElement('button');
  dispose.className = 'ais-ClearRefinements-button';
  dispose.textContent = 'Remove instance';

  const node = document.createElement('div');

  actions.appendChild(description);
  actions.appendChild(add);
  actions.appendChild(remove);
  actions.appendChild(dispose);

  container.appendChild(actions);
  container.appendChild(node);

  const widget = fn(node);

  search.addWidget(widget);
  setDisabledState(add, true);

  add.addEventListener('click', () => {
    search.addWidget(widget);
    setDisabledState(add, true);
    setDisabledState(remove, false);
  });

  remove.addEventListener('click', () => {
    search.removeWidget(widget);
    setDisabledState(add, false);
    setDisabledState(remove, true);
  });

  dispose.addEventListener('click', () => {
    search.dispose();
    setDisabledState(add, true);
    setDisabledState(remove, true);
    setDisabledState(dispose, true);
  });
};
