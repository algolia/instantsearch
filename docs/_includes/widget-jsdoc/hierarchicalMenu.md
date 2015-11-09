| Param | Description |
| --- | --- |
|  <span class='attr-required'>`options.container`</span> | CSS Selector or DOMElement to insert the widget |
|  <span class='attr-required'>`options.attributes`</span> | Array of attributes to use to generate the hierarchy of the menu. Refer to [the readme](https://github.com/algolia/algoliasearch-helper-js#hierarchical-facets) for the convention to follow. |
|  <span class='attr-optional'>`options.sortBy`</span> | How to sort refinements. Possible values: `count|isRefined|name:asc|desc` |
|  <span class='attr-optional'>`options.limit`</span> | How much facet values to get |
|  <span class='attr-optional'>`options.cssClasses`</span> | CSS classes to add to the wrapping elements: root, list, item |
|  <span class='attr-optional'>`options.cssClasses.root`</span> | CSS class to add to the root element |
|  <span class='attr-optional'>`options.cssClasses.header`</span> | CSS class to add to the header element |
|  <span class='attr-optional'>`options.cssClasses.body`</span> | CSS class to add to the body element |
|  <span class='attr-optional'>`options.cssClasses.footer`</span> | CSS class to add to the footer element |
|  <span class='attr-optional'>`options.cssClasses.list`</span> | CSS class to add to the list element |
|  <span class='attr-optional'>`options.cssClasses.item`</span> | CSS class to add to each item element |
|  <span class='attr-optional'>`options.cssClasses.active`</span> | CSS class to add to each active element |
|  <span class='attr-optional'>`options.cssClasses.link`</span> | CSS class to add to each link (when using the default template) |
|  <span class='attr-optional'>`options.cssClasses.count`</span> | CSS class to add to each count element (when using the default template) |
|  <span class='attr-optional'>`options.templates`</span> | Templates to use for the widget |
|  <span class='attr-optional'>`options.templates.header`</span> | Header template (root level only) |
|  <span class='attr-optional'>`options.templates.item`</span> | Item template |
|  <span class='attr-optional'>`options.templates.footer`</span> | Footer template (root level only) |
|  <span class='attr-optional'>`options.transformData`</span> | Method to change the object passed to the item template |
|  <span class='attr-optional'>`options.autoHideContainer`</span> | Hide the container when there are no items in the menu |

<p class="attr-legend">* <span>Required</span></p>
