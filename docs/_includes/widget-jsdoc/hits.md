| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to add |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code></span> | CSS class to add to the wrapping element |
| <span class='attr-optional'>`options.cssClasses.empty`</span><span class="attr-infos">Type: <code>string</code></span> | CSS class to add to the wrapping element when no results |
| <span class='attr-optional'>`options.cssClasses.item`</span><span class="attr-infos">Type: <code>string</code></span> | CSS class to add to each result |
| <span class='attr-optional'>`options.templates`</span><span class="attr-infos">Type: <code>Object</code></span> | Templates to use for the widget |
| <span class='attr-optional'>`options.templates.empty`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Template to use when there are no results. |
| <span class='attr-optional'>`options.templates.item`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Template to use for each result. |
| <span class='attr-optional'>`options.transformData`</span><span class="attr-infos">Type: <code>Object</code></span> | Method to change the object passed to the templates |
| <span class='attr-optional'>`options.transformData.empty`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>function</code></span> | Method used to change the object passed to the empty template |
| <span class='attr-optional'>`options.transformData.item`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>function</code></span> | Method used to change the object passed to the item template |
| <span class='attr-optional'>`hitsPerPage`</span><span class="attr-infos">Default:<code class="attr-default">20</code><br />Type: <code>number</code></span> | The number of hits to display per page |

<p class="attr-legend">* <span>Required</span></p>
