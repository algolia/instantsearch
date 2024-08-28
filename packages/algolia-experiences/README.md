# `algolia-experiences`

This package allows you to use Algolia without code, by creating experiences in the Algolia dashboard and embedding them in your website.

## Usage

To get started, load the script tag and configuration in your HTML file, and add a `data-experience-id` attribute to the container where you want to render the UI.

```html
<!DOCTYPE html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/algolia-experiences@1"></script>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/instantsearch.css@8/themes/satellite.min.css"
  />
  <meta
    name="algolia-configuration"
    content='{"appId":"latency","apiKey":"6be0576ff61c053d5f9a3225e2a90f76"}'
  />
</head>

<body>
  <div data-experience-id="my-experience-id"></div>
</body>
```

The `data-experience-id` attribute should be set to the experience ID you want to use. You can find the experience ID in the dashboard.

For styling, you can use the [instantsearch.css](https://www.npmjs.com/package/instantsearch.css) package.
