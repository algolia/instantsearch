import Clipboard from 'clipboard';

export default function activateClipboard(codeSamples) {
  codeSamples.forEach(codeSample => {
    const cleanAfter = 800;
    let timeout;
    const copyToClipboard = document.createElement('button');

    const setup = () => {
      clearTimeout(timeout);
      copyToClipboard.innerHTML = '<span class="icon icon-copy"><svg><use xlink:href="#icon-copy" /></svg></span>';
      copyToClipboard.setAttribute('title', 'copy')
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
    heading.innerHTML = 'Code';
    heading.appendChild(copyToClipboard);
    codeSample.parentNode.insertBefore(heading, codeSample);

    copyToClipboard.addEventListener('mouseleave', setup, true);
    clipboard.on('success', () => {
      done();
      timeout = setTimeout(setup, cleanAfter);
    });
  });
}
