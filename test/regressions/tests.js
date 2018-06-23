/* global happo */

import { render, unmountComponentAtNode } from 'react-dom';
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

// Remove the GeoSearch stories from the
// tests because they are too brittle
const stories = require.context(
  '../../stories',
  true,
  /^((?!GeoSearch).)*\.stories\.js$/
);

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

// Clean up the event handlers
happo.cleanOutElement = function(element) {
  unmountComponentAtNode(element);
};

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
          if (window.openHTTPs !== 0) {
            return;
          }

          clearInterval(interval);

          // Now that the requests have completed, we need to wait for a couple of
          // animation frames to go by before we think components will have finished
          // rendering.
          requestAnimationFrame(() => {
            // Start render
            requestAnimationFrame(() => {
              // Finish rendering
              resolve();
            });
          });
        }, 100);
      }),
    { viewports: ['medium'] }
  );
});
