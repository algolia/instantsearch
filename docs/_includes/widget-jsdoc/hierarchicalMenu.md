<h4 class="no-toc">Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span>
</p>
<p class="attr-description">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-required'>`options.attributes`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">Array of attributes to use to generate the hierarchy of the menu. Refer to [the readme](https://github.com/algolia/algoliasearch-helper-js#hierarchical-facets) for the convention to follow.</p>
<p class="attr-name">
<span class='attr-optional'>`options.separator`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27; &gt; &#x27;</code>(<code>string</code>)</span>
</p>
<p class="attr-description">Separator used in the attributes to separate level values.</p>
<p class="attr-name">
<span class='attr-optional'>`options.rootPath`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">Prefix path to use if the first level is not the root level.</p>
<p class="attr-name">
<span class='attr-optional'>`options.showParentLevel`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">false</code>(<code>string</code>)</span>
</p>
<p class="attr-description">Show the parent level of the current refined value</p>
<p class="attr-name">
<span class='attr-optional'>`options.limit`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">10</code>(<code>number</code>)</span>
</p>
<p class="attr-description">How much facet values to get</p>
<p class="attr-name">
<span class='attr-optional'>`options.sortBy`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">[&#x27;name:asc&#x27;]</code>(<code>Array.&lt;string&gt;</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">Templates to use for the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.header`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code>(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Header template (root level only)</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Item template, provided with `name`, `count`, `isRefined`, `url` data properties</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.footer`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code>(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Footer template (root level only)</p>
<p class="attr-name">
<span class='attr-optional'>`options.transformData.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span>
</p>
<p class="attr-description">Method to change the object passed to the `item` template</p>
<p class="attr-name">
<span class='attr-optional'>`options.autoHideContainer`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">true</code>(<code>boolean</code>)</span>
</p>
<p class="attr-description">Hide the container when there are no items in the menu</p>
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
<span class='attr-optional'>`options.cssClasses.depth`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each item element to denote its depth. The actual level will be appended to the given class name (ie. if `depth` is given, the widget will add `depth0`, `depth1`, ... according to the level of each item).</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.active`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each active element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.link`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each link (when using the default template)</p>
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
