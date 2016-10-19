---
title: Styling
layout: guide.pug
category: core
---

Default widgets in react-instantsearch comes with some styling already applied and loaded. When styling components, you can decide to either extend or completely replace our default styles, using CSS classes or inline styles.

All widgets accept a `theme` prop. This prop is a map of keys to corresponding `className` or `style` prop values. The different theme keys supported by every widgets are described on their respective documentation page. 

By default, we provide `defaultClassNames` for each widgets but they are mostly not styled. However, the `SearchBox`, `RangeRatings`, `Range` and `Pagination` widgets are delivered with a built-in style and are ready to use without any configuration on your side. 

## CSS classes styling

### Reusing our class names

By default we provide BEM class names to every element of a widget. That way it's very easy for you to replace or extend the style of a widget. 

Let's see an example with the `RangeInput` widget:

```html
<form data-reactroot="" class="ais-RangeInput__root">
	<label class="ais-RangeInput__labelMin">
		<input type="number" class="ais-RangeInput__inputMin" value="0.39">
	</label>
	<span class="ais-RangeInput__separator">to</span>
	<label class="ais-RangeInput__labelMax">
		<input type="number" class="ais-RangeInput__inputMax" value="799">
	</label>
	<button class="ais-RangeInput__submit" type="submit">go</button>
</form>
```

If you want to change the color of the separator you may have a css file with the following style: 

```css
	ais-RangeInput__separator {
		color: 'red'
	}
```

### Providing your own classes

The BEM classes we provide can be change to suits your need. To change them, you'll need to use the `theme` prop of a widget by passing an object that will map theme keys to your class names. 

Let's see an example if we want to change the class names of the `RangeInput` widget:

```js
	const rangeInputClassNames = {
		root: 'root-class-name',
		labelMin: 'label-min-class-name',
		inputMin: 'input-min-class-name',
		separator: 'separator-class-name',
		labelMax: 'labelMax-class-name',
		inputMax: 'input-max-class-name',
		submit: 'submit-class-name'
	}
	<RangeInput theme={rangeInputClassNames} />
```

## Inline styling

### Providing inline styles

You can style widgets by using directly inline styles. It can be achieved by providing an object that will map theme keys to your inline styles. 

Let's see an example to use inline styles on the `RangeInput` widget: 

```js
	const rangeInputInlineStyles = {
		root: {/*inlineStyles*/},
		labelMin: {/*inlineStyles*/},
		inputMin: {/*inlineStyles*/},
		separator: {/*inlineStyles*/},
		labelMax: {/*inlineStyles*/},
		inputMax: {/*inlineStyles*/},
		submit: {/*inlineStyles*/}
	}
	<RangeInput theme={rangeInputInlineStyles} />
```

Be careful, if you pass a new theme to the `theme` props, it will erase completely the one we provide by default. 

### Extending our default theme

As told above, passing a new theme to the `theme` props will erase completely the one we provide by default, including default class names. Howerver, it could be convenient to keep a default theme and just be able to change some of its properties. To do that, we provide a function called `extendTheme`.

This function takes the widget `defaultClassNames` and the inline styles you want to apply and return a new theme. Those `defaultClassNames` can be retrieve on any widgets. 

Let's see an example by changing the color of the `SearchBox` submit button: 

```js
	import {SearchBox, extendTheme} from 'react-instantsearch';

	const searchBoxExtendedStyle = {
		submit: {
			backgroundColor: 'red',
		}
	}
	
	<SearchBox theme={extendTheme(SearchBox.defaultClassNames, searchBoxExtendedStyle)} >/
```

**Remember, you can find the available theme keys for a widget on their documentation page.**

## react-themeable

We use [`react-themeable`](https://github.com/markdalgleish/react-themeable) to style `react-instantsearch` widgets. We explained how to style widgets using class names or inline styles, but indeed the `theme` prop accepts any parameter that react-themeable supports. You can find all available options [on their website](https://github.com/markdalgleish/react-themeable).

## Tooling

### Localized CSS with babel

Default styling in `react-instantsearch` is done using css-modules. However, you have nothing to import other than the widget itself to enjoy our default themes. 

When building `react-instantsearch` we are using [babel-plugin-transform-inline-localize-css-import](https://github.com/algolia/babel-plugin-transform-inline-localize-css-import). We've made this babel plugin in order to be able to embed both class names and styles inside our widgets.

If you want you can also use it with your own code and load the css with [`insert-css`](https://github.com/substack/insert-css).

```js
import theme from './theme.css'

insertCss(theme.code);

<SearchBox theme={theme.classNames}/>
```
