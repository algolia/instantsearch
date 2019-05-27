/**
 * Collapses the `rangeSlider` whenever the `rangeInput` is collapsed.
 *
 * InstantSearch.js doesn't support multiple widgets wrapped in a single `panel`.
 * In the demo, both the `rangeInput` and the `rangeSlider` are visually contained
 * in a single panel.
 */
function spyCssClassMutationsAndCopy({ source, target }) {
  const observerConfig = { attributes: true };
  const observer = new MutationObserver(mutations => {
    mutations
      .filter(
        mutation =>
          mutation.attributeName === 'class' && mutation.target === source
      )
      .forEach(mutation => {
        target.className = mutation.target.className;
      });
  });

  observer.observe(source, observerConfig);
}

export { spyCssClassMutationsAndCopy };
