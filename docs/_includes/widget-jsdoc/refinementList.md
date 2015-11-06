| Param | Description |
| --- | --- |
|  <span class='attr-required'>`options.container`</span> | CSS Selector or DOMElement to insert the widget |
|  <span class='attr-required'>`options.facetName`</span> | Name of the attribute for faceting |
|  <span class='attr-optional'>`options.operator`</span> | How to apply refinements. Possible values: `or`, `and` |
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
|  <span class='attr-optional'>`options.cssClasses.label`</span> | CSS class to add to each label element (when using the default template) |
|  <span class='attr-optional'>`options.cssClasses.checkbox`</span> | CSS class to add to each checkbox element (when using the default template) |
|  <span class='attr-optional'>`options.cssClasses.count`</span> | CSS class to add to each count element (when using the default template) |
|  <span class='attr-optional'>`options.templates`</span> | Templates to use for the widget |
|  <span class='attr-optional'>`options.templates.header`</span> | Header template |
|  <span class='attr-optional'>`options.templates.item`</span> | Item template, provided with `name`, `count`, `isRefined` |
|  <span class='attr-optional'>`options.templates.footer`</span> | Footer template |
|  <span class='attr-optional'>`options.transformData`</span> | Function to change the object passed to the item template |
|  <span class='attr-optional'>`options.autoHideContainer`</span> | Hide the container when no items in the refinement list |

<p class="attr-legend">* <span>Required</span></p>
