| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.container`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>DOMElement</code></span> | CSS Selector or DOMElement to insert the widget |
| <span class='attr-required'>`options.attributes`</span><span class="attr-infos">Type: <code>Array.&lt;string&gt;</code></span> | Array of attributes to use to generate the hierarchy of the menu. Refer to [the readme](https://github.com/algolia/algoliasearch-helper-js#hierarchical-facets) for the convention to follow. |
| <span class='attr-optional'>`options.separator`</span><span class="attr-infos">Default:<code class="attr-default">&#x27; &gt; &#x27;</code><br />Type: <code>string</code></span> | Separator used in the attributes to separate level values. |
| <span class='attr-optional'>`options.rootPath`</span><span class="attr-infos">Type: <code>string</code></span> | Prefix path to use if the first level is not the root level. |
| <span class='attr-optional'>`options.showParentLevel`</span><span class="attr-infos">Default:<code class="attr-default">false</code><br />Type: <code>string</code></span> | Show the parent level of the current refined value |
| <span class='attr-optional'>`options.limit`</span><span class="attr-infos">Default:<code class="attr-default">10</code><br />Type: <code>number</code></span> | How much facet values to get |
| <span class='attr-optional'>`options.sortBy`</span><span class="attr-infos">Default:<code class="attr-default">[&#x27;name:asc&#x27;]</code><br />Type: <code>Array.&lt;string&gt;</code> &#124; <code>function</code></span> | How to sort refinements. Possible values: `count|isRefined|name:asc|desc` |
| <span class='attr-optional'>`options.templates`</span><span class="attr-infos">Type: <code>Object</code></span> | Templates to use for the widget |
| <span class='attr-optional'>`options.templates.header`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Header template (root level only) |
| <span class='attr-optional'>`options.templates.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>function</code></span> | Item template, provided with `name`, `count`, `isRefined`, `url` data properties |
| <span class='attr-optional'>`options.templates.footer`</span><span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code><br />Type: <code>string</code> &#124; <code>function</code></span> | Footer template (root level only) |
| <span class='attr-optional'>`options.transformData.item`</span><span class="attr-infos">Type: <code>function</code></span> | Method to change the object passed to the `item` template |
| <span class='attr-optional'>`options.autoHideContainer`</span><span class="attr-infos">Default:<code class="attr-default">true</code><br />Type: <code>boolean</code></span> | Hide the container when there are no items in the menu |
| <span class='attr-optional'>`options.cssClasses`</span><span class="attr-infos">Type: <code>Object</code></span> | CSS classes to add to the wrapping elements |
| <span class='attr-optional'>`options.cssClasses.root`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the root element |
| <span class='attr-optional'>`options.cssClasses.header`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the header element |
| <span class='attr-optional'>`options.cssClasses.body`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the body element |
| <span class='attr-optional'>`options.cssClasses.footer`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the footer element |
| <span class='attr-optional'>`options.cssClasses.list`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to the list element |
| <span class='attr-optional'>`options.cssClasses.item`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each item element |
| <span class='attr-optional'>`options.cssClasses.depth`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each item element to denote its depth. The actual level will be appended to the given class name (ie. if `depth` is given, the widget will add `depth0`, `depth1`, ... according to the level of each item). |
| <span class='attr-optional'>`options.cssClasses.active`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each active element |
| <span class='attr-optional'>`options.cssClasses.link`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each link (when using the default template) |
| <span class='attr-optional'>`options.cssClasses.count`</span><span class="attr-infos">Type: <code>string</code> &#124; <code>Array.&lt;string&gt;</code></span> | CSS class to add to each count element (when using the default template) |
| <span class='attr-optional'>`options.collapsible`</span><span class="attr-infos">Default:<code class="attr-default">false</code><br />Type: <code>object</code> &#124; <code>boolean</code></span> | Hide the widget body and footer when clicking on header |
| <span class='attr-optional'>`options.collapsible.collapsed`</span><span class="attr-infos">Type: <code>boolean</code></span> | Initial collapsed state of a collapsible widget |

<p class="attr-legend">* <span>Required</span></p>
