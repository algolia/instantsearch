<h4 class="no-toc">Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span>
</p>
<p class="attr-description important">Valid CSS Selector as a string or DOMElement</p>
<p class="attr-name">
<span class='attr-required'>`options.attributeName`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description important">Name of the attribute for faceting</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">Templates to use for the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Item template. Template data: `from`, `to` and `currency`</p>
<p class="attr-name">
<span class='attr-optional'>`options.currency`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;$&#x27;</code>(<code>string</code>)</span>
</p>
<p class="attr-description">The currency to display</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">Labels to use for the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels.separator`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Separator label, between min and max</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels.button`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Button label</p>
<p class="attr-name">
<span class='attr-optional'>`options.autoHideContainer`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">true</code>(<code>boolean</code>)</span>
</p>
<p class="attr-description">Hide the container when no refinements available</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">CSS classes to add</p>
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
<span class='attr-optional'>`options.cssClasses.list`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the wrapping list element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each item element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.active`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the active item element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.link`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each link element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.form`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the form element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.label`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each wrapping label of the form</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.input`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each input of the form</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.currency`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to each currency element of the form</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.separator`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the separator of the form</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.button`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the submit button of the form</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.footer`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the footer element</p>
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
