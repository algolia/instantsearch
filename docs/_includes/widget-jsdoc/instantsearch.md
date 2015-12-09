| Param | Description |
| --- | --- |
| <span class='attr-required'>`options.appId`</span><span class="attr-infos">Type: <code>string</code></span> | The Algolia application ID |
| <span class='attr-required'>`options.apiKey`</span><span class="attr-infos">Type: <code>string</code></span> | The Algolia search-only API key |
| <span class='attr-required'>`options.indexName`</span><span class="attr-infos">Type: <code>string</code></span> | The name of the main index |
| <span class='attr-optional'>`options.numberLocale`</span><span class="attr-infos">Type: <code>string</code></span> | The locale used to display numbers. |
| <span class='attr-optional'>`options.searchParameters`</span><span class="attr-infos">Type: <code>string</code></span> | Initial search configuration. |
| <span class='attr-optional'>`options.urlSync`</span><span class="attr-infos">Type: <code>Object</code> &#124; <code>boolean</code></span> | Url synchronization configuration. Setting to `true` will synchronize the needed search parameters with the browser url. |
| <span class='attr-optional'>`options.urlSync.trackedParameters`</span><span class="attr-infos">Type: <code>string</code></span> | Parameters that will be synchronized in the URL. By default, it will track the query, all the refinable attribute (facets and numeric filters), the index and the page. All the algoliasearch helper parameters can be filtered: https://community.algolia.com/algoliasearch-helper-js/docs/SearchParameters.html |
| <span class='attr-optional'>`options.urlSync.useHash`</span><span class="attr-infos">Type: <code>string</code></span> | If set to true, the url will be hash based. Otherwise, it'll use the query parameters using the modern history API. |
| <span class='attr-optional'>`options.urlSync.threshold`</span><span class="attr-infos">Type: <code>string</code></span> | Time in ms after which a new state is created in the browser history. The default value is 700. |

<p class="attr-legend">* <span>Required</span></p>
