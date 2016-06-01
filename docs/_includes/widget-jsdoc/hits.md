<h4>Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span> 
</p>
<p class="attr-description">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">Templates to use for the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.empty`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code>(<code>string</code> &#124; <code>function</code>)</span> 
</p>
<p class="attr-description">Template to use when there are no results.</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.item`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code>(<code>string</code> &#124; <code>function</code>)</span> 
</p>
<p class="attr-description">Template to use for each result. This template will receive an object containing a single record.</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.allItems`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;&#x27;</code>(<code>string</code> &#124; <code>function</code>)</span> 
</p>
<p class="attr-description">Template to use for the list of all results. (Can't be used with `item` template). This template will receive a complete SearchResults result object, this object contains the key hits that contains all the records retrieved.</p>
<p class="attr-name">
<span class='attr-optional'>`options.transformData`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">Method to change the object passed to the templates</p>
<p class="attr-name">
<span class='attr-optional'>`options.transformData.empty`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span> 
</p>
<p class="attr-description">Method used to change the object passed to the `empty` template</p>
<p class="attr-name">
<span class='attr-optional'>`options.transformData.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span> 
</p>
<p class="attr-description">Method used to change the object passed to the `item` template</p>
<p class="attr-name">
<span class='attr-optional'>`options.transformData.allItems`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span> 
</p>
<p class="attr-description">Method used to change the object passed to the `allItems` template</p>
<p class="attr-name">
<span class='attr-optional'>`hitsPerPage`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">20</code>(<code>number</code>)</span> 
</p>
<p class="attr-description">The number of hits to display per page</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">CSS classes to add</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.root`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to the wrapping element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.empty`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to the wrapping element when no results</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to each result</p>

<p class="attr-legend">* <span>Required</span></p>
