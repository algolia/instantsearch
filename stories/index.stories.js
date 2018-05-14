import { storiesOf } from '@storybook/html';

storiesOf('Demo', module)
  .add('heading', () => '<h1>Hello World</h1>')
  .add('button', () => {
    const button = document.createElement('button');
    button.innerText = 'Hello Button';
    // eslint-disable-next-line no-console
    button.addEventListener('click', e => console.log(e));
    return button;
  });
