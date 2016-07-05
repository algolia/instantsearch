# instantsearch-react

This is an attempt at implementing the [API proposal](https://github.com/algolia/instantsearch.js/blob/instantsearch-react-kickstart/packages/instantsearch-react/README.md) for a React implementation of instantsearch.js.

The idea is to use a Redux-like architecture under the hood, while leaving it up to the user whether they want to control the state of the InstantSearch component or let it manage its own state. The current implementation manages its own state, but having it be managed from the outside is (probably) just a matter of exposing `{ state, dispatch }` props.

At this point I've basically re-implemented a very barebones Redux. We might end up using Redux itself, but it's very likely what we have now will suffice going forward.

## Things to figure out

* The helper already implements all our actions and keeps the state immutable, so we could probably create them automatically. Maybe make this easier/supported on the helper side?
* Routing.
* Styling.
* A bunch of other things.

## Setting it up

For now this is built more like an app than a library.

Just `npm install` and `npm start`, go to `http://localhost:8080/` and you should be good to go.
