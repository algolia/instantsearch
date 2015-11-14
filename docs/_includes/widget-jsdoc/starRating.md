| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-required'>`options.attributeName`</span><span class="attr-infos">Type: <code>string</code></span> | Name of the attribute for filtering |
| <span class='attr-optional'>`options.max`</span><span class="attr-infos">Type: <code>number</code></span> | The maximum rating value |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to add to the wrapping elements: root, list, item |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the root element |
| <span class='attr-optional'>`options.cssClasses.header`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the header element |
| <span class='attr-optional'>`options.cssClasses.body`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the body element |
| <span class='attr-optional'>`options.cssClasses.footer`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the footer element |
| <span class='attr-optional'>`options.cssClasses.list`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the list element |
| <span class='attr-optional'>`options.cssClasses.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each item element |
| <span class='attr-optional'>`options.cssClasses.link`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each link element |
| <span class='attr-optional'>`options.cssClasses.disabledLink`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each disabled link (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.star`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each star element (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.emptyStar`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each empty star element (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.active`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each active element |
| <span class='attr-optional'>`options.labels`</span><span class="attr-infos">Type: <code>Object</code></span> | Labels used by the default template |
| <span class='attr-optional'>`options.labels.andUp`</span><span class="attr-infos">Type: <code>string</code></span> | The label suffixed after each line |
| <span class='attr-optional'>`options.templates`</span><span class="attr-infos">Type: <code>Object</code></span> | Templates to use for the widget |
| <span class='attr-optional'>`options.templates.header`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Header template |
| <span class='attr-optional'>`options.templates.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Item template, provided with `name`, `count`, `isRefined` |
| <span class='attr-optional'>`options.templates.footer`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Footer template |
| <span class='attr-optional'>`options.transformData`</span><span class="attr-infos">Type: <code>function</code></span> | Function to change the object passed to the item template |
| <span class='attr-optional'>`options.autoHideContainer`</span><span class="attr-infos">Default:<code class="attr-default">true</code><br />Type: <code>boolean</code></span> | Hide the container when no results match |

<p class="attr-legend">* <span>Required</span></p>
