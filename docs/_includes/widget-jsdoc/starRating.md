<h4>Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span> 
</p>
<p class="attr-description">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-required'>`options.attributeName`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">Name of the attribute for filtering</p>
<p class="attr-name">
<span class='attr-optional'>`options.max`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>number</code>)</span> 
</p>
<p class="attr-description">The maximum rating value</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">Labels used by the default template</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels.andUp`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">The label suffixed after each line</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">Templates to use for the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.header`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span> 
</p>
<p class="attr-description">Header template</p>
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
<p class="attr-description">Hide the container when no results match</p>
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
<span class='attr-optional'>`options.cssClasses.link`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to each link element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.disabledLink`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to each disabled link (when using the default template)</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.star`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to each star element (when using the default template)</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.emptyStar`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to each empty star element (when using the default template)</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.active`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS class to add to each active element</p>
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
