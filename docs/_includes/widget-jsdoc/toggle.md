| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-required'>`options.attributeName`</span><span class="attr-infos">Type: <code>string</code></span> | Name of the attribute for faceting (eg. "free_shipping") |
| <span class='attr-required'>`options.label`</span><span class="attr-infos">Type: <code>string</code></span> | Human-readable name of the filter (eg. "Free Shipping") |
| <span class='attr-optional'>`options.values`</span><span class="attr-infos">Type: <code>Object</code></span> | Lets you define the values to filter on when toggling |
| <span class='attr-optional'>`options.values.on`</span><span class="attr-infos">Type: <code>\*</code></span> | Value to filter on when checked |
| <span class='attr-optional'>`options.values.off`</span><span class="attr-infos">Type: <code>\*</code></span> | Value to filter on when unchecked element (when using the default template) |
| <span class='attr-optional'>`options.templates`</span><span class="attr-infos">Type: <code>Object</code></span> | Templates to use for the widget |
| <span class='attr-optional'>`options.templates.header`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Header template |
| <span class='attr-optional'>`options.templates.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Item template |
| <span class='attr-optional'>`options.templates.footer`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Footer template |
| <span class='attr-optional'>`options.transformData`</span><span class="attr-infos">Type: <code>function</code></span> | Function to change the object passed to the item template |
| <span class='attr-optional'>`options.autoHideContainer`</span><span class="attr-infos">Default:<code class="attr-default">true</code><br />Type: <code>boolean</code></span> | Hide the container when there's no results |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to add |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the root element |
| <span class='attr-optional'>`options.cssClasses.header`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the header element |
| <span class='attr-optional'>`options.cssClasses.body`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the body element |
| <span class='attr-optional'>`options.cssClasses.footer`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the footer element |
| <span class='attr-optional'>`options.cssClasses.list`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the list element |
| <span class='attr-optional'>`options.cssClasses.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each item element |
| <span class='attr-optional'>`options.cssClasses.active`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each active element |
| <span class='attr-optional'>`options.cssClasses.label`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each label element (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.checkbox`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each checkbox element (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.count`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each count |

<p class="attr-legend">* <span>Required</span></p>
