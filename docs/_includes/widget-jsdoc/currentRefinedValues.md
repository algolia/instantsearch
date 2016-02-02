| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-optional'>`option.attributes`</span><span class="attr-infos">Type: <code>Array</code></span> | Attributes configuration |
| <span class='attr-optional'>`option.attributes[].name`</span><span class="attr-infos">Type: <code>string</code></span> | Required attribute name |
| <span class='attr-optional'>`option.attributes[].label`</span><span class="attr-infos">Type: <code>string</code></span> | Attribute label (passed to the item template) |
| <span class='attr-optional'>`option.attributes[].template`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Attribute specific template |
| <span class='attr-optional'>`option.attributes[].transformData`</span><span class="attr-infos">Type: <code>function</code></span> | Attribute specific transformData |
| <span class='attr-optional'>`option.clearAll`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;before&#x27;</code><br />Type: <code>boolean</code> &#124; <code>string</code></span> | Clear all position (one of ('before', 'after', false)) |
| <span class='attr-optional'>`options.onlyListedAttributes`</span><span class="attr-infos">Default:<code class="attr-default">false</code><br />Type: <code>boolean</code></span> | Only use declared attributes |
| <span class='attr-optional'>`options.templates`</span><span class="attr-infos">Type: <code>Object</code></span> | Templates to use for the widget |
| <span class='attr-optional'>`options.templates.header`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Header template |
| <span class='attr-optional'>`options.templates.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Item template |
| <span class='attr-optional'>`options.templates.clearAll`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Clear all template |
| <span class='attr-optional'>`options.templates.footer`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Footer template |
| <span class='attr-optional'>`options.transformData`</span><span class="attr-infos">Type: <code>function</code></span> | Function to change the object passed to the `body` template |
| <span class='attr-optional'>`options.autoHideContainer`</span><span class="attr-infos">Default:<code class="attr-default">true</code><br />Type: <code>boolean</code></span> | Hide the container when no current refinements |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to be added |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the root element |
| <span class='attr-optional'>`options.cssClasses.header`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the header element |
| <span class='attr-optional'>`options.cssClasses.body`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the body element |
| <span class='attr-optional'>`options.cssClasses.clearAll`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the clearAll element |
| <span class='attr-optional'>`options.cssClasses.list`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the list element |
| <span class='attr-optional'>`options.cssClasses.item`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the item element |
| <span class='attr-optional'>`options.cssClasses.link`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the link element |
| <span class='attr-optional'>`options.cssClasses.count`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the count element |
| <span class='attr-optional'>`options.cssClasses.footer`</span><span class="attr-infos">Type: <code>string</code></span> | CSS classes added to the footer element |

<p class="attr-legend">* <span>Required</span></p>
