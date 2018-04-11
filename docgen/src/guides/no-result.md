---
title: Designing the no-result page
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 10
editable: true
githubSource: docgen/src/guides/no-result.md
---
## Designing the no results page

When a query returns no results, it is important to let the user know that their query led to no results.

By doing so, we’re acknowledging that not all queries lead to some result and with some additional hints we can let them continue to use the search. This way, there is less chance that the user will leave the website to do a search to an external search engine.

There are various strategies that can be implemented for the no-result. This guide will walk you through one that can be easily implemented with InstantSearch.js:
  - first we'll improve the message that we provide to the user
  - then we’ll add a button to let the user clear the filters

## Display a message

By default, InstantSearch.js will only display "no results" when there are no results. The bare minimum to handle the no-result case is to provide the user with a message that indicates that no results were found in a friendly fashion.

In order to do that, we can use the InstantSeach.js’ Hits widget option [templates.empty](hits.html#struct-HitsTemplates-empty):

```javascript
const search = instantsearch(/* parameters */);
search.addWidget(instantsearch.widgets.hits({
  container: 'hits',
  templates: {
    empty: '<p class="info">No results were found with your current filters. Try to remove some filters or change the search query.</p>',
    item: yourItemTemplate
  },
}));
```

When there are no results, the user will see a paragraph that says: "No results were found with your current filters. Try to remove some filters or change the search query.".

## Let the user clear all the filters

To go further, we can also let the user clear the filters and start their search from scratch. This way, we allow the user to make mistake.

To be able to do this part, you need to have the URL sync mechanism activated so that we can easily clear the filters using the URL. You can activate the URL Sync by adding to your InstantSearch instance:

```javascript
const search = instantsearch({
  /* your other parameters */
  urlSync: true
});
```

This will give you a basic configuration of the url sync. Check out the [reference](instantsearch.html#struct-InstantSearchOptions-urlSync) if you want to learn more about URL sync.

URL sync makes your InstantSearch.js app aware of changes in the URL. With this, we can easily influence the parameters of the search. In this case, we want to clear all the filters so we can make a link to this page, without the parameters.

We do this by customizing again the no-result template and adding it a clear all link:

```javascript
const search = instantsearch(/* parameters */);
search.addWidget(instantsearch.widgets.hits({
  container: 'hits',
  templates: {
    empty: '<p class="info">No results were found with your current filters. <br/> <a class="button" href=".">Clear all the filters</a></p>',
    item: yourItemTemplate
  },
}));
```

The secret of this last part is to use `.` as the href of the "clear all the filters" link. You can go further and make this link look like a button.

## Conclusion

In this guide, you’ve learned:

  * The value of providing a clear no-result page
  * How to make the messaging more friendly
  * How to let the user clear all the filters when there are no results
