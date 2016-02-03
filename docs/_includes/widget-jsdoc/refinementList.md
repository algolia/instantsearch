| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-required'>`options.attributeName`</span><span class="attr-infos">Type: <code>string</code></span> | Name of the attribute for faceting |
| <span class='attr-optional'>`options.operator`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;or&#x27;</code><br />Type: <code>string</code></span> | How to apply refinements. Possible values: `or`, `and` |
| <span class='attr-optional'>`options.sortBy`</span><span class="attr-infos">Default:<code class="attr-default">[&#x27;count:desc&#x27;]</code><br />Type: <code>Array.&lt;string&gt;</code> &#124; <code>function</code></span> | How to sort refinements. Possible values: `count|isRefined|name:asc|desc` |
| <span class='attr-optional'>`options.limit`</span><span class="attr-infos">Default:<code class="attr-default">10</code><br />Type: <code>string</code></span> | How much facet values to get. When the show more feature is activated this is the minimun number of facets requested (the show more button is not in active state). |
| <span class='attr-optional'>`options.showMore`</span><span class="attr-infos">Default:<code class="attr-default">false</code><br />Type: <code>object</code> &#124; <code>boolean</code></span> | Limit the number of results and display a showMore button |
| <span class='attr-optional'>`options.showMore.templates`</span><span class="attr-infos">Type: <code>object</code></span> | Templates to use for showMore |
| <span class='attr-optional'>`options.showMore.templates.active`</span><span class="attr-infos">Type: <code>object</code></span> | Template used when showMore was clicked |
| <span class='attr-optional'>`options.showMore.templates.inactive`</span><span class="attr-infos">Type: <code>object</code></span> | Template used when showMore not clicked |
| <span class='attr-optional'>`options.showMore.limit`</span><span class="attr-infos">Type: <code>object</code></span> | Max number of facets values to display when showMore is clicked |
| <span class='attr-optional'>`options.templates`</span><span class="attr-infos">Type: <code>Object</code></span> | Templates to use for the widget |
| <span class='attr-optional'>`options.templates.header`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Header template |
| <span class='attr-optional'>`options.templates.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Item template, provided with `name`, `count`, `isRefined`, `url` data properties |
| <span class='attr-optional'>`options.templates.footer`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Footer template |
| <span class='attr-optional'>`options.transformData`</span><span class="attr-infos">Type: <code>function</code></span> | Function to change the object passed to the item template |
| <span class='attr-optional'>`options.autoHideContainer`</span><span class="attr-infos">Default:<code class="attr-default">true</code><br />Type: <code>boolean</code></span> | Hide the container when no items in the refinement list |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to add to the wrapping elements |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the root element |
| <span class='attr-optional'>`options.cssClasses.header`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the header element |
| <span class='attr-optional'>`options.cssClasses.body`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the body element |
| <span class='attr-optional'>`options.cssClasses.footer`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the footer element |
| <span class='attr-optional'>`options.cssClasses.list`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the list element |
| <span class='attr-optional'>`options.cssClasses.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each item element |
| <span class='attr-optional'>`options.cssClasses.active`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each active element |
| <span class='attr-optional'>`options.cssClasses.label`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each label element (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.checkbox`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each checkbox element (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.count`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each count element (when using the default template) |

<p class="attr-legend">* <span>Required</span></p>
