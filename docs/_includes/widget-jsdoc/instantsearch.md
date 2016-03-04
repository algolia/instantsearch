| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.appId`</span><span class="attr-infos">Type: <code>string</code></span> | The Algolia application ID |
| <span class='attr-required'>`options.apiKey`</span><span class="attr-infos">Type: <code>string</code></span> | The Algolia search-only API key |
| <span class='attr-required'>`options.indexName`</span><span class="attr-infos">Type: <code>string</code></span> | The name of the main index |
| <span class='attr-optional'>`options.numberLocale`</span><span class="attr-infos">Type: <code>string</code></span> | The locale used to display numbers. This will be passed to Number.prototype.toLocaleString() |
| <span class='attr-optional'>`options.searchParameters`</span><span class="attr-infos">Type: <code>Object</code></span> | Additional parameters to pass to the Algolia API. [Full documentation](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html) |
| <span class='attr-optional'>`options.urlSync`</span><span class="attr-infos">Type: <code>Object</code> &#124; <code>boolean</code></span> | Url synchronization configuration. Setting to `true` will synchronize the needed search parameters with the browser url. |
| <span class='attr-optional'>`options.urlSync.trackedParameters`</span><span class="attr-infos">Type: <code>Array.&lt;string&gt;</code></span> | Parameters that will be synchronized in the URL. By default, it will track the query, all the refinable attribute (facets and numeric filters), the index and the page. [Full documentation](https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html) |
| <span class='attr-optional'>`options.urlSync.useHash`</span><span class="attr-infos">Type: <code>boolean</code></span> | If set to true, the url will be hash based. Otherwise, it'll use the query parameters using the modern history API. |
| <span class='attr-optional'>`options.urlSync.threshold`</span><span class="attr-infos">Type: <code>number</code></span> | Time in ms after which a new state is created in the browser history. The default value is 700. |
| <span class='attr-optional'>`options.searchFunction`</span><span class="attr-infos">Type: <code>function</code></span> | A hook that will be called each time a search needs to be done, with the helper as a parameter. It's your responsibility to call helper.search(). This option allows you to avoid doing searches at page load for example. |

<p class="attr-legend">* <span>Required</span></p>
