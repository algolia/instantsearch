<h4>Parameters</h4>
<p class="attr-name">
<span class='attr-required'>`options.appId`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">The Algolia application ID</p>
<p class="attr-name">
<span class='attr-required'>`options.apiKey`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">The Algolia search-only API key</p>
<p class="attr-name">
<span class='attr-required'>`options.indexName`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">The name of the main index</p>
<p class="attr-name">
<span class='attr-optional'>`options.numberLocale`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>string</code>)</span> 
</p>
<p class="attr-description">The locale used to display numbers. This will be passed to Number.prototype.toLocaleString()</p>
<p class="attr-name">
<span class='attr-optional'>`options.searchFunction`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span> 
</p>
<p class="attr-description">A hook that will be called each time a search needs to be done, with the helper as a parameter. It's your responsibility to call helper.search(). This option allows you to avoid doing searches at page load for example.</p>
<p class="attr-name">
<span class='attr-optional'>`options.searchParameters`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">Additional parameters to pass to the Algolia API. [Full documentation](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html)</p>
<p class="attr-name">
<span class='attr-optional'>`options.urlSync`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code> &#124; <code>boolean</code>)</span> 
</p>
<p class="attr-description">Url synchronization configuration. Setting to `true` will synchronize the needed search parameters with the browser url.</p>
<p class="attr-name">
<span class='attr-optional'>`options.urlSync.mapping`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Object</code>)</span> 
</p>
<p class="attr-description">Object used to define replacement query parameter to use in place of another. Keys are current query parameters and value the new value, e.g. `{ q: 'query' }`.</p>
<p class="attr-name">
<span class='attr-optional'>`options.urlSync.threshold`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>number</code>)</span> 
</p>
<p class="attr-description">Idle time in ms after which a new state is created in the browser history. The default value is 700. The url is always updated at each keystroke but we only create a "previous search state" (activated when click on back button) every 700ms of idle time.</p>
<p class="attr-name">
<span class='attr-optional'>`options.urlSync.trackedParameters`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>Array.&lt;string&gt;</code>)</span> 
</p>
<p class="attr-description">Parameters that will be synchronized in the URL. By default, it will track the query, all the refinable attribute (facets and numeric filters), the index and the page. [Full documentation](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html)</p>
<p class="attr-name">
<span class='attr-optional'>`options.urlSync.useHash`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>boolean</code>)</span> 
</p>
<p class="attr-description">If set to true, the url will be hash based. Otherwise, it'll use the query parameters using the modern history API.</p>
<p class="attr-name">
<span class='attr-optional'>`options.urlSync.getHistoryState`<span class="show-description">…</span></span>
  <span class="attr-infos">(<code>function</code>)</span> 
</p>
<p class="attr-description">Pass this function to override the default history API state we set to `null`. For example this could be used to force passing {turbolinks: true} to the history API every time we update it.</p>

<p class="attr-legend">* <span>Required</span></p>
