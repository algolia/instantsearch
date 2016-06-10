<h4 class="no-toc">Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.container`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>DOMElement</code>)</span>
</p>
<p class="attr-description">CSS Selector or DOMElement to insert the widget</p>
<p class="attr-name">
<span class='attr-optional'>`options.placeholder`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span>
</p>
<p class="attr-description">Input's placeholder</p>
<p class="attr-name">
<span class='attr-optional'>`options.poweredBy`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">false</code>(<code>boolean</code> &#124; <code>Object</code>)</span>
</p>
<p class="attr-description">Define if a "powered by Algolia" link should be added near the input</p>
<p class="attr-name">
<span class='attr-optional'>`options.poweredBy.template`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code> &#124; <code>string</code>)</span>
</p>
<p class="attr-description">Template used for displaying the link. Can accept a function or a Hogan string.</p>
<p class="attr-name">
<span class='attr-optional'>`options.poweredBy.cssClasses`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>number</code>)</span>
</p>
<p class="attr-description">CSS classes to add</p>
<p class="attr-name">
<span class='attr-optional'>`options.poweredBy.cssClasses.root`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the root element</p>
<p class="attr-name">
<span class='attr-optional'>`options.poweredBy.cssClasses.link`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the link element</p>
<p class="attr-name">
<span class='attr-optional'>`options.wrapInput`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">true</code>(<code>boolean</code>)</span>
</p>
<p class="attr-description">Wrap the input in a `div.ais-search-box`</p>
<p class="attr-name">
<span class='attr-optional'>`autofocus`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">&#x27;auto&#x27;</code>(<code>boolean</code> &#124; <code>string</code>)</span>
</p>
<p class="attr-description">autofocus on the input</p>
<p class="attr-name">
<span class='attr-optional'>`options.searchOnEnterKeyPressOnly`<span class="show-description">…</span></span>
  <span class="attr-infos">Default:<code class="attr-default">false</code>(<code>boolean</code>)</span>
</p>
<p class="attr-description">If set, trigger the search once `<Enter>` is pressed only</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span>
</p>
<p class="attr-description">CSS classes to add</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.root`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the wrapping div (if `wrapInput` set to `true`)</p>
<p class="attr-name">
<span class='attr-optional'>`options.cssClasses.input`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code> &#124; <code>Array.&lt;string&gt;</code>)</span>
</p>
<p class="attr-description">CSS class to add to the input</p>
<p class="attr-name">
<span class='attr-optional'>`options.queryHook`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span>
</p>
<p class="attr-description">A function that will be called every time a new search would be done. You will get the query as first parameter and a search(query) function to call as the second parameter. This queryHook can be used to debounce the number of searches done from the searchBox.</p>

<p class="attr-legend">* <span>Required</span></p>
