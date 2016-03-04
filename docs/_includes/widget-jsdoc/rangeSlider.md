| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-required'>`options.attributeName`</span><span class="attr-infos">Type: <code>string</code></span> | Name of the attribute for faceting |
| <span class='attr-optional'>`options.tooltips`</span><span class="attr-infos">Default:<code class="attr-default">true</code><br />Type: <code>boolean</code> &#124; <code>Object</code></span> | Should we show tooltips or not. The default tooltip will show the formatted corresponding value without any other token. You can also provide `tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}` So that you can format the tooltip display value as you want |
| <span class='attr-optional'>`options.templates`</span><span class="attr-infos">Type: <code>Object</code></span> | Templates to use for the widget |
| <span class='attr-optional'>`options.templates.header`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Header template |
| <span class='attr-optional'>`options.templates.footer`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Footer template |
| <span class='attr-optional'>`options.autoHideContainer`</span><span class="attr-infos">Default:<code class="attr-default">true</code><br />Type: <code>boolean</code></span> | Hide the container when no refinements available |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to add to the wrapping elements |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the root element |
| <span class='attr-optional'>`options.cssClasses.header`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the header element |
| <span class='attr-optional'>`options.cssClasses.body`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the body element |
| <span class='attr-optional'>`options.cssClasses.footer`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the footer element |
| <span class='attr-optional'>`options.collapsible`</span><span class="attr-infos">Default:<code class="attr-default">false</code><br />Type: <code>object</code> &#124; <code>boolean</code></span> | Hide the widget body and footer when clicking on header |
| <span class='attr-optional'>`options.collapsible.collapsed`</span><span class="attr-infos">Type: <code>boolean</code></span> | Initial collapsed state of a collapsible widget |
| <span class='attr-optional'>`options.min`</span><span class="attr-infos">Type: <code>number</code></span> | Minimal slider value, default to automatically computed from the result set |
| <span class='attr-optional'>`options.max`</span><span class="attr-infos">Type: <code>number</code></span> | Maximal slider value, defaults to automatically computed from the result set |

<p class="attr-legend">* <span>Required</span></p>
