<h4>Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span> 
</p>
<p class="attr-description">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">Text to display in the various links (prev, next, first, last)</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels.previous`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">Label for the Previous link</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels.next`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">Label for the Next link</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels.first`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">Label for the First link</p>
<p class="attr-name">
<span class='attr-optional'>`options.labels.last`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">Label for the Last link</p>
<p class="attr-name">
<span class='attr-optional'>`options.maxPages`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>number</code>)</span> 
</p>
<p class="attr-description">The max number of pages to browse</p>
<p class="attr-name">
<span class='attr-optional'>`options.padding`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">3</code>(<code>number</code>)</span> 
</p>
<p class="attr-description">The number of pages to display on each side of the current page</p>
<p class="attr-name">
<span class='attr-optional'>`options.scrollTo`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;body&#x27;</code>(<code>string</code> &#124; <code>DOMElement</code> &#124; <code>boolean</code>)</span> 
</p>
<p class="attr-description">Where to scroll after a click, set to `false` to disable</p>
<p class="attr-name">
<span class='attr-optional'>`options.showFirstLast`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">true</code>(<code>boolean</code>)</span> 
</p>
<p class="attr-description">Define if the First and Last links should be displayed</p>
<p class="attr-name">
<span class='attr-optional'>`options.autoHideContainer`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">true</code>(<code>boolean</code>)</span> 
</p>
<p class="attr-description">Hide the container when no results match</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">CSS classes to be added</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.root`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to the parent `<ul>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.item`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to each `<li>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.link`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to each link</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.page`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to page `<li>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.previous`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to the previous `<li>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.next`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to the next `<li>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.first`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to the first `<li>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.last`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to the last `<li>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.active`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to the active `<li>`</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.disabled`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">CSS classes added to the disabled `<li>`</p>

<p class="attr-legend">* <span>Required</span></p>
