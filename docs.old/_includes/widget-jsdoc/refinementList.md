<h4 class="no-toc">Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span>
</p>
<p class="attr-description important">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-required'>`options.attributeName`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description important">Name of the attribute for faceting</p>
<p class="attr-name">
<span class='attr-optional important'>`options.operator`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;or&#x27;</code>(<code>string</code>)</span>
</p>
<p class="attr-description important">How to apply refinements. Possible values: `or`, `and`</p>
<p class="attr-name">
<span class='attr-optional important'>`options.sortBy`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">[&#x27;count:desc&#x27;, &#x27;name:asc&#x27;]</code>(<code>Array.&lt;string&gt;</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description important">How to sort refinements. Possible values: `count:asc|count:desc|name:asc|name:desc|isRefined`.   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).</p>
<p class="attr-name">
<span class='attr-optional important'>`options.limit`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">10</code>(<code>string</code>)</span>
</p>
<p class="attr-description important">How much facet values to get. When the show more feature is activated this is the minimum number of facets requested (the show more button is not in active state).</p>
<p class="attr-name">
<span class='attr-optional'>`options.searchForFacetValues`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">false</code>(<code>object</code> &#124; <code>boolean</code>)</span>
</p>
<p class="attr-description">Add a search input to let the user search for more facet values</p>
<p class="attr-name">
<span class='attr-optional'>`options.searchForFacetValues.placeholder`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">Value of the search field placeholder</p>
<p class="attr-name">
<span class='attr-optional'>`options.searchForFacetValues.templates`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">Templates to use for search for facet values</p>
<p class="attr-name">
<span class='attr-optional'>`options.searchForFacetValues.templates.noResults`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">Templates to use for search for facet values</p>
<p class="attr-name">
<span class='attr-optional'>`options.showMore`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">false</code>(<code>object</code> &#124; <code>boolean</code>)</span>
</p>
<p class="attr-description">Limit the number of results and display a showMore button</p>
<p class="attr-name">
<span class='attr-optional'>`options.showMore.templates`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>object</code>)</span>
</p>
<p class="attr-description">Templates to use for showMore</p>
<p class="attr-name">
<span class='attr-optional'>`options.showMore.templates.active`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>object</code>)</span>
</p>
<p class="attr-description">Template used when showMore was clicked</p>
<p class="attr-name">
<span class='attr-optional'>`options.showMore.templates.inactive`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>object</code>)</span>
</p>
<p class="attr-description">Template used when showMore not clicked</p>
<p class="attr-name">
<span class='attr-optional'>`options.showMore.limit`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>object</code>)</span>
</p>
<p class="attr-description">Max number of facets values to display when showMore is clicked</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">Templates to use for the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.header`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Header template, provided with `refinedFacetsCount` data property</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Item template, provided with `name`, `count`, `isRefined`, `url` data properties</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.footer`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Footer template</p>
<p class="attr-name">
<span class='attr-optional'>`options.transformData.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span>
</p>
<p class="attr-description">Function to change the object passed to the `item` template</p>
<p class="attr-name">
<span class='attr-optional'>`options.autoHideContainer`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">true</code>(<code>boolean</code>)</span>
</p>
<p class="attr-description">Hide the container when no items in the refinement list</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">CSS classes to add to the wrapping elements</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.root`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the root element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.header`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the header element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.body`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the body element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.footer`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the footer element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.list`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the list element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each item element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.active`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each active element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.label`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each label element (when using the default template)</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.checkbox`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each checkbox element (when using the default template)</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.count`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each count element (when using the default template)</p>
<p class="attr-name">
<span class='attr-optional'>`options.collapsible`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">false</code>(<code>object</code> &#124; <code>boolean</code>)</span>
</p>
<p class="attr-description">Hide the widget body and footer when clicking on header</p>
<p class="attr-name">
<span class='attr-optional'>`options.collapsible.collapsed`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>boolean</code>)</span>
</p>
<p class="attr-description">Initial collapsed state of a collapsible widget</p>

<p class="attr-legend">* <span>Required</span></p>
