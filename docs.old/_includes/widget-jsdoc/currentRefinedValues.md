<h4 class="no-toc">Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span>
</p>
<p class="attr-description important">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-optional'>`option.attributes`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Array</code>)</span>
</p>
<p class="attr-description">Attributes configuration</p>
<p class="attr-name">
<span class='attr-optional'>`option.attributes[].name`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">Required attribute name</p>
<p class="attr-name">
<span class='attr-optional'>`option.attributes[].label`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">Attribute label (passed to the item template)</p>
<p class="attr-name">
<span class='attr-optional'>`option.attributes[].template`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Attribute specific template</p>
<p class="attr-name">
<span class='attr-optional'>`option.attributes[].transformData`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span>
</p>
<p class="attr-description">Attribute specific transformData</p>
<p class="attr-name">
<span class='attr-optional'>`option.clearAll`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;before&#x27;</code>(<code>boolean</code> &#124; <code>string</code>)</span>
</p>
<p class="attr-description">Clear all position (one of ('before', 'after', false))</p>
<p class="attr-name">
<span class='attr-optional'>`options.onlyListedAttributes`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">false</code>(<code>boolean</code>)</span>
</p>
<p class="attr-description">Only use declared attributes</p>
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
<p class="attr-description">Item template</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.clearAll`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Clear all template</p>
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
<p class="attr-description">Hide the container when no current refinements</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">CSS classes to be added</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.root`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the root element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.header`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the header element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.body`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the body element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.clearAll`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the clearAll element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.list`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the list element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the item element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.link`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the link element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.count`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the count element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.footer`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">CSS classes added to the footer element</p>
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
