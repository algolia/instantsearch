---
title: Create a calendar widget
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 20
editable: true
githubSource: docgen/src/guides/calendar-widget.md
indexName: concert_events_instantsearchjs
---

Search results often need to be refined by dates. Calendars are a good visual way to improve the user experience when it comes to filtering dates. InstantSearch provides custom widgets to create reusable components within your app.

By the end of this guide, you'll understand how to implement a calendar widget to refine your results based on a single date and a range of dates. You can [preview](examples/calendar-widget/) and [download](examples/calendar-widget.zip) the concert app that you'll be able to build.

## Before we start

Algolia handles dates as numeric values. We'll store them as JavaScript timestamps, which are the number of milliseconds since the year 1970 ([see `Date.prototype.getTime()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime)).

Through this guide, we'll use a [generated concert dataset](https://raw.githubusercontent.com/algolia/datasets/master/concerts/alternative_rock_artists.json) that contains the following attributes:

* `name`: the name of the music band
* `location`: the venue of the concert
* `date`: the date of the event we will refine the results with

Both `name` and `location` will be added to the [searchable attributes](https://www.algolia.com/doc/guides/ranking/searchable-attributes/) in the Algolia dashboard so that the user can filter events on their name and their location.

To learn more about creating your own dataset and uploading it to an Algolia index, you can read the guide on [importing from the dashboard](https://www.algolia.com/doc/tutorials/indexing/importing-data/importing-from-the-dashboard/).

## Bootstrapping an InstantSearch app

If you don't yet have an InstantSearch app to work on, you can use the command-line tool [`create-instantsearch-app`](https://github.com/algolia/create-instantsearch-app) that bootstraps an app for you. It will provide a basic JavaScript application including [instantsearch.js](https://github.com/algolia/instantsearch.js) itself. Make sure to create an index in your Algolia dashboard before any further steps.

If you're using [npm](https://www.npmjs.com/):

```sh
npx create-instantsearch-app [name-of-your-new-app]
```

If you're using [Yarn](https://yarnpkg.com):

```sh
yarn create instantsearch-app [name-of-your-new-app]
```

The command-line tool will ask for your credentials. To use this guide's dataset, enter the following:

* Application ID: `latency`
* Search API key: `059c79ddd276568e990286944276464a`
* Index name: `concert_events_instantsearchjs`

The main searchable attribute doesn't matter much because we are going to override the widget.

![create-instantsearch-app](images/create-instantsearch-app-events.png)

## Customizing the results

The default `item` template from the `hits` widget provided by `create-instantsearch-app` is great, but we're going to enhance it to display the relevant information of our dataset.

```javascript
search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: hit => `
        <li class="hit">
          <h3>
            ${hit._highlightResult.name.value}
            <small>in ${hit._highlightResult.location.value}</small>
          </h3>
          <small>on <strong>${new Date(hit.date)}</strong></small>
        </li>
      `,
    },
  })
);
```

We use the function syntax for the `item` template because we want to convert the numeric timestamp from our dataset to a JavaScript date on the fly. Be careful with user-generated data. You can use existing libraries to prevent XSS or use a [template](widgets-common-api.html#templates) and [`transformData`](widgets-common-api.html#transformdata) instead.

*Note: we've highlighted the event's name as well as its location because we set them both as searchable in the Algolia dashboard.*

## Refining the results

### Using a calendar library

This guide will not focus on creating a calendar element itself, but rather on connecting an existing calendar to InstantSearch.

We'll use the [Baremetrics Calendar](https://github.com/Baremetrics/calendar) which depends on [jQuery](https://jquery.com/) and [Moments](https://momentjs.com/) through the tutorial. This calendar provides a good user experience and supports date ranges. You can use any calendar library that suits your needs to continue this guide.

We need to add the dependencies at the end of the `body`.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js"></script>
<script src="https://unpkg.com/BaremetricsCalendar@1.0.11/public/js/Calendar.js"></script>
```

In order for the Baremetrics Calendar to work, we need to define a `#calendar` element that is going to be attached the calendar itself:

```html
<div id="calendar" class="daterange"></div>
```

We'll attach the calendar to the element in the next section.

### Creating our custom widget

InstantSearch doesn't provide any calendar widgets. Yet, there are two widgets handling numeric ranges: [`rangeInput`](widgets/rangeInput.html) and [`rangeSlider`](widgets/rangeSlider.html). If we were to use these widgets, we wouldn't be able to customize their rendering. Both of these widgets are based on the [`connectRange`](connectors/connectRange.html) connector which handles their logic. Because the dates are stored as numeric values in our dataset, we are going to use this connector to create our custom calendar widget.

If you are not yet familiar with [connectors](connectors.html), you can think of them as the logic-only part of your widget. It doesn't render anything -- that's what makes them reusable.

A connector takes a rendering function which is called every time the search is refined. The calendar library we're using only needs to be initialized once. Luckily, the second parameter of the `connectRange` callback function is `isFirstRendering`. We, therefore, can instantiate the calendar only at the first rendering.

```javascript
const datePicker = instantsearch.connectors.connectRange(
  (options, isFirstRendering) => {
    if (!isFirstRendering) return;

    /* bind the calendar to the connector here */
  }
);
```

`connectRange` is passed as its first argument's callback a [`RangeRenderingOptions`](connectors/connectRange.html#struct-RangeRenderingOptions) object which contains the `refine(Array<number,number>)` function. The two numbers that need to be passed are the start and the end dates as numeric timestamps.

In our connector instantiation, we need to attach the calendar and specify its callback function to refine the search. This part will be specific to the calendar library that you use in your app. In the Baremetrics Calendar, this function is passed to the `callback` argument.

```javascript
const datePicker = instantsearch.connectors.connectRange(
  (options, isFirstRendering) => {
    if (!isFirstRendering) return;

    const { refine } = options;

    new Calendar({
      element: $('#calendar'),
      callback: function() {
        const start = new Date(this.start_date).getTime();
        const end = new Date(this.end_date).getTime();

        refine([start, end]);
      },
      // Some good parameters based on our dataset:
      start_date: new Date(),
      end_date: new Date('01/01/2020'),
      earliest_date: new Date('01/01/2008'),
      latest_date: new Date('01/01/2020'),
    });
  }
);
```

We've now created our widget factory `datePicker`. In order to use it, you must instantiate it with a [`CustomRangeWidgetOptions`](connectors/connectRange.html#struct-CustomRangeWidgetOptions) object, specifying the `attributeName` parameter: the index key we are refining with. In our case, since it is a calendar widget, we want to refine on the `date` attribute of our dataset.

```javascript
search.addWidget(
  datePicker({
    attributeName: 'date',
  })
);
```

### Optional: Adding support for single dates

The Baremetrics Calendar works by default only with date ranges. A single parameter is necessary to support a specific date: `same_day_range`. However, when you set this parameter, you get twice the same day set at midnight, which is an empty interval. This results in an issue with our dataset's values: say your event is "31/01/2020 20:00", if you filter your results down to the single date "31 January 2020", it will look for events between "31/01/2020 00:00" and "31/01/2020 00:00". The event won't be within this range.

This issue can be solved quite easily with JavaScript date manipulation. We need to check if the start date and the end date are the same. If so, we add one day to the end date. The interval will therefore be: "31/01/2020 00:00" and "31/01/2020 23:59", which is what the user expects.

```javascript
const ONE_DAY_IN_MS = 3600 * 24 * 1000;

const datePicker = instantsearch.connectors.connectRange(
  (options, isFirstRendering) => {
    if (!isFirstRendering) return;

    const { refine } = options;

    new Calendar({
      element: $('#calendar'),
      same_day_range: true,
      callback: function() {
        const start = new Date(this.start_date).getTime();
        const end = new Date(this.end_date).getTime();
        const actualEnd = start === end ? end + ONE_DAY_IN_MS - 1 : end;

        refine([start, actualEnd]);
      },
    });
  }
);
```

## Conclusion

Throughout this guide, you've learned:

* How to leverage connectors to build custom widgets
* How to refine your search with numeric values
* How to create a calendar widget

You can go [try](examples/calendar-widget/) and [download](examples/calendar-widget.zip) the app we've built.
