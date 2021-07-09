import { createWidgetMixin } from '../mixins/widget';
import { EXPERIMENTAL_connectDynamicWidgets } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';

function getWidgetAttribute(vnode) {
  const props = vnode.componentOptions && vnode.componentOptions.propsData;
  if (props) {
    if (props.attribute) {
      return props.attribute;
    }
    if (Array.isArray(props.attributes)) {
      return props.attributes[0];
    }
  }

  const children =
    vnode.componentOptions && vnode.componentOptions.children
      ? vnode.componentOptions.children
      : vnode.children;

  if (Array.isArray(children)) {
    // return first child with a truthy attribute
    return children.reduce(
      (acc, curr) => acc || getWidgetAttribute(curr),
      undefined
    );
  }

  return undefined;
}

export default {
  name: 'AisExperimentalDynamicWidgets',
  mixins: [
    createWidgetMixin({ connector: EXPERIMENTAL_connectDynamicWidgets }),
    createSuitMixin({ name: 'DynamicWidgets' }),
  ],
  props: {
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  render(createElement) {
    const components = new Map();
    (this.$slots.default || []).forEach(vnode => {
      const attribute = getWidgetAttribute(vnode);
      if (attribute) {
        components.set(
          attribute,
          createElement(
            'div',
            { key: attribute, class: [this.suit('widget')] },
            [vnode]
          )
        );
      }
    });

    // by default, render everything, but hidden so that the routing doesn't disappear
    if (!this.state) {
      const allComponents = [];
      components.forEach(component => allComponents.push(component));

      return createElement(
        'div',
        { attrs: { hidden: true }, class: [this.suit()] },
        allComponents
      );
    }

    return createElement(
      'div',
      { class: [this.suit()] },
      this.state.attributesToRender.map(attribute => components.get(attribute))
    );
  },
  computed: {
    widgetParams() {
      return {
        transformItems: this.transformItems,
        // we do not pass "widgets" to the connector, since Vue is in charge of rendering
        widgets: [],
      };
    },
  },
};
