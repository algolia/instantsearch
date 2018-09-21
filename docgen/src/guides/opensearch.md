---
title: Integrate OpenSearch
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 10
editable: true
githubSource: docgen/src/guides/opensearch.md
---

OpenSearch is web standard that makes browsers aware of an underlying search
engine on a website. By implementing this, browsers will let the users search
into your web application directly from the URL bar (in Chrome for example) or
in a dedicated search input (like in Firefox).

Implementing OpenSearch with Algolia and InstantSearch.js is just a few steps
away, let’s see how this is done.

## How OpenSearch works

The OpenSearch standard defines the way the webpage should tell the browser how
to interact with the search engine. This interaction is based on a URL pattern
that is defined with an XML file. This XML file should be reference in the
`<head>` of the webpage using a link tag. 

Since the URL will serve as the way for the browser to provide information to
the webapp, we will first see how to activate this mechanism in
InstantSearch.js.

## Activating the URL sync

In InstantSearch.js, URL synchronisation is just an option away. To get
started, you need to add this to the initialization of InstantSearch.js:

```diff
const search = instantsearch({
  indexName: opts.indexName,
  searchClient: algoliasearch(opts.appId, opts.apiKey),
+ urlSync: true,
});
```

You can further customize the behavior of urlSync. You can, for example, change
which are the parameters tracked by the urlSync feature. In this case you have
to be careful to keep the query parameter in it.[citation needed]

Once this is configured we can move on and describe the search URL for the
browser.

## Define the search engine description

The search engine is described using an XML file. The complete specification of
this file can be found on [opensearch.org](http://www.opensearch.org/Home). For
now, we’ll focus on making it work for our example.

Let’s first create the file, following this template:

```xml
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>shortName</ShortName>
  <Description>description</Description>
  <Url type="text/html" method="get" template="https://mysite.com?q={searchTerms}"/>
  <InputEncoding>UTF-8</InputEncoding>
  <Image height="32" width="32"type="image/png">linkToImage</Image>
</OpenSearchDescription>
```

> note that you can’t add the xml declaration (`<?xml version="1.0"?>`),
> because otherwise it won’t show up in Firefox

Let’s review the important parts of this file that you should update to fit
your website:

* `<ShortName>`: this is the name of your app / website search. It should be less
 than 17 characters

* `<Description>`: this is a human readable description of your app / website
 search engine.

* template in `<Url>`: this is pattern that the browser will follow to create the
 URL to your website / app search engine.

* `<Image>`: *linkToImage* is the URL to a png image that represents your website,
 the favicon should be fine, for example:
 [https://community.algolia.com/instantsearch.js/v2/assets/img/favicon.png](https://community.algolia.com/instantsearch.js/v2/assets/img/favicon.png)

Defining all that is not enough for the browser to be aware of the search
engine.

## Link the search engine description from the page

In order for the browser to be aware of the search engine, we need to declare
in the webpage. We can do this by adding a `<link>` in the `<head>`, like so:

```html
<html>
<head>
  <link rel="search" href="/opensearch.xml" type="application/opensearchdescription+xml" title="Playlist search">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.js@2.1.0/dist/instantsearch.min.css">
  <link rel="icon" type="image/png" href="img/touch/favicon.png"/>
</head>
```

It’s as simple as that. From now on, every user going through the website will
have the search engine registered automatically. When using Chrome, the user
will then be able to search directly on your website by taping the domain name
and then [tab]. When using firefox, they can even add it manually in a
dedicated search box in the browser.

Be careful, the cache of the XML file is long and updating it requires
to remove it from settings, which can be tedious depending on the browser.

## Going further

So now you know the basics of OpenSearch and the integration with
InstantSearch.js. To go further, we suggest the followings links:

* The [URL parameters](http://localhost:3000/instantsearch.html#struct-InstantSearchOptions-urlSync) of InstantSearch.js

* The [OpenSearch spec](http://www.opensearch.org/Home) – and the reference
 from browser and search engines such as [Yandex](https://yandex.com/support/browser/search-and-browse/search.xml#search-boundary),
 [Mozilla](https://developer.mozilla.org/en/Add-ons/Creating_OpenSearch_plugins_for_Firefox),
 [Google](http://dev.chromium.org/tab-to-search),
 [Apple](https://developer.apple.com/library/content/releasenotes/General/WhatsNewInSafari/Articles/Safari_8_0.html)

If you’ve build something great with InstantSearch.js and if you have
questions, don’t forget to post on the [community forum](https://discourse.algolia.com/).

