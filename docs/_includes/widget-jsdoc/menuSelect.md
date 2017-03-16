<h4 class="no-toc">Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span>
</p>
<p class="attr-description important">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-optional important'>`options.sortBy`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">[&#x27;count:desc&#x27;, &#x27;name:asc&#x27;]</code>(<code>Array.&lt;string&gt;</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description important">How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).</p>
<p class="attr-name">
<span class='attr-optional important'>`options.limit`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">10</code>(<code>string</code>)</span>
</p>
<p class="attr-description important">How many facets values to retrieve</p>
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
<span class='attr-optional'>`options.templates.footer`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>function</code>)</span>
</p>
<p class="attr-description">Footer template</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.seeAllOption`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">First option of <select> template</p>
<p class="attr-name">
<span class='attr-optional'>`options.templates.selectOption`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span>
</p>
<p class="attr-description">Other options of <select> template, provided with `name`, `count`, `isRefined` data properties</p>
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
<span class='attr-optional'>`options.cssClasses.select`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the <select> element</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.option`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the <option> element</p>
<p class="attr-name">
<span class='attr-optional'>`options.autoHideContainer`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">true</code>(<code>boolean</code>)</span>
</p>
<p class="attr-description">Hide the container when there are no items in the menu</p>

<p class="attr-legend">* <span>Required</span></p>
