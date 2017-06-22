/* global happo */

import { render } from 'react-dom';
import { getStorybook } from '@storybook/react';
import './XMLHttpRequest';

// For debugging
// import 'happo-target-firefox/lib/HappoRunner';
// setTimeout(() => {
//   happo.renderExample('<index>-multihits', console.log)
// }, 1000)

function normalize(string) {
  return string.replace(/[ -/]/g, '_');
}

const stories = require.context('../../stories', true, /\.stories\.js$/);

// loadStories
stories.keys().forEach(filename => stories(filename));
const tests = getStorybook().reduce((acc, book) => {
  book.stories.forEach(story => {
    acc.push({
      suite: normalize(book.kind),
      name: normalize(story.name),
      case: story.render,
      context: {
        kind: book.kind,
        story: story.name,
      },
    });
  });

  return acc;
}, []);

let interval;

tests.forEach(test => {
  happo.define(
    `${test.suite}-${test.name}`,
    () =>
      new Promise(resolve => {
        const div = document.createElement('div');
        div.style.padding = '8px';
        div.style.display = 'inline-block';
        document.body.appendChild(div);
        render(test.case(test.context), div);

        clearInterval(interval);
        interval = setInterval(() => {
          if (window.openHTTPs === 0) {
            clearInterval(interval);
            resolve();
            return;
          }
        }, 100);
      }),
    { viewports: ['medium'] }
  );
});
