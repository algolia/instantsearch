| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-required'>`options.attributeName`</span><span class="attr-infos">Type: <code>string</code></span> | Name of the numeric attribute to use |
| <span class='attr-required'>`options.options`</span><span class="attr-infos">Type: <code>Array</code></span> | Array of objects defining the different values and labels |
| <span class='attr-required'>`options.options[i].value`</span><span class="attr-infos">Type: <code>number</code></span> | The numerical value to refine with |
| <span class='attr-required'>`options.options[i].label`</span><span class="attr-infos">Type: <code>string</code></span> | Label to display in the option |
| <span class='attr-optional'>`options.operator`</span><span class="attr-infos">Type: <code>string</code></span> | The operator to use to refine |
| <span class='attr-optional'>`options.autoHideContainer`</span><span class="attr-infos">Default:<code class="attr-default">false</code><br />Type: <code>boolean</code></span> | Hide the container when no results match |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to be added |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS classes added to the parent `<select>` |
| <span class='attr-optional'>`options.cssClasses.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS classes added to each `<option>` |

<p class="attr-legend">* <span>Required</span></p>
