import Clipboard from 'clipboard';

export default function activateClipboard(codeSamples) {
  codeSamples.forEach(codeSample => {
    const cleanAfter = 500;
    let timeout;
    const copyToClipboard = document.createElement('span');

    const setup = () => {
      clearTimeout(timeout);
      copyToClipboard.textContent = 'Copy to clipboard';
      copyToClipboard.classList.remove('clipboard-done');
      copyToClipboard.classList.add('clipboard');
    };

    const done = () => {
      copyToClipboard.classList.add('clipboard-done');
      copyToClipboard.textContent = 'Copied!';
    };

    const clipboard = new Clipboard(copyToClipboard, {
      text: () => codeSample.querySelector('code').textContent,
    });

    setup();
    codeSample.querySelector('.heading').appendChild(copyToClipboard);
    copyToClipboard.addEventListener('mouseleave', setup, true);
    clipboard.on('success', () => {
      done();
      timeout = setTimeout(setup, cleanAfter);
    });
  });
}
