import Clipboard from 'clipboard';

export default function activateClipboard(codeSamples) {
  codeSamples.forEach(codeSample => {
    const cleanAfter = 800;
    let timeout;
    const copyToClipboard = document.createElement('button');
    const codeAttribute = codeSample.getAttribute('data-code-type');

    const setup = () => {
      clearTimeout(timeout);
      copyToClipboard.innerHTML = '<i class="icon icon-copy"></i>';
      copyToClipboard.setAttribute('title', 'copy');
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

    const heading = document.createElement('div');
    heading.className = 'heading';

    // eslint-disable-next-line no-unused-expressions
    codeAttribute === 'Command'
      ? (heading.innerHTML = 'Command')
      : (heading.innerHTML = 'Code');
    heading.appendChild(copyToClipboard);
    codeSample.parentNode.insertBefore(heading, codeSample);

    copyToClipboard.addEventListener('mouseleave', setup, true);
    clipboard.on('success', () => {
      done();
      timeout = setTimeout(setup, cleanAfter);
    });
  });
}
