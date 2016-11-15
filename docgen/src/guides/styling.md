---
title: Styling
layout: guide.pug
category: guide
navWeight: 6
---

Default widgets in react-instantsearch comes with some styling already applied and loaded. When styling components, you can decide to either extend or completely replace our default styles, using CSS class names.

The different class names used by every widgets are described on their respective documentation page.

## CSS classes styling

By default we provide BEM class names to every element of a widget. That way it's very easy for you to replace or extend the style of a widget.

Let's see an example with the `RangeInput` widget:

```text/html
<form data-reactroot="" class="ais-RangeInput__root">
	<label class="ais-RangeInput__labelMin">
		<input type="number" 
		       class="ais-RangeInput__inputMin" 
		       value="0.39" />
	</label>
	<span class="ais-RangeInput__separator">to</span>
	<label class="ais-RangeInput__labelMax">
		<input type="number" 
		       class="ais-RangeInput__inputMax" 
		       value="799" />
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

## Tooling

### Localized CSS with babel

Default styling in `react-instantsearch` is done using css-modules. However, you have nothing to import other than the widget itself to enjoy our default themes.

When building `react-instantsearch` we are using [babel-plugin-transform-inline-localize-css-import](https://github.com/algolia/babel-plugin-transform-inline-localize-css-import). We've made this babel plugin in order to be able to embed both class names and styles inside our widgets.

If you want you can also use it with your own code and load the css with [`insert-css`](https://github.com/substack/insert-css).

```javascript
import theme from './theme.css'

insertCss(theme.code);

<SearchBox theme={theme.classNames}/>
```
