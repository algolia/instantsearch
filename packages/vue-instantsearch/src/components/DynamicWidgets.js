import { createWidgetMixin } from '../mixins/widget';
import { connectDynamicWidgets } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';
import { _objectSpread } from '../util/polyfills';
import { isVue3, renderCompat, getDefaultSlot } from '../util/vue-compat';

function getWidgetAttribute(vnode) {
  const props = isVue3
    ? vnode.props
    : vnode.componentOptions && vnode.componentOptions.propsData;
  if (props) {
    if (props.attribute) {
      return props.attribute;
    }
    if (Array.isArray(props.attributes)) {
      return props.attributes[0];
    }
  }

  let children;
  if (isVue3) {
    children =
      vnode.children && vnode.children.default && vnode.children.default();
  } else {
    children =
      vnode.componentOptions && vnode.componentOptions.children
        ? vnode.componentOptions.children
        : vnode.children;
  }

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
  name: 'AisDynamicWidgets',
  mixins: [
    createWidgetMixin(
      {
        connector: connectDynamicWidgets,
      },
      {
        $$widgetType: 'ais.dynamicWidgets',
      }
    ),
    createSuitMixin({ name: 'DynamicWidgets' }),
  ],
  props: {
    transformItems: {
      type: Function,
      default: undefined,
    },
    facets: {
      type: Array,
      default: undefined,
    },
    maxValuesPerFacet: {
      type: Number,
      default: undefined,
    },
  },
  render: renderCompat(function (h) {
    const components = new Map();

    (getDefaultSlot(this) || []).forEach((vnode) => {
      const attribute = getWidgetAttribute(vnode);
      if (attribute) {
        components.set(
          attribute,
          h('div', { key: attribute, class: [this.suit('widget')] }, [vnode])
        );
      }
    });

    // by default, render everything, but hidden so that the routing doesn't disappear
    if (!this.state) {
      const allComponents = [];
      components.forEach((component) => allComponents.push(component));

      return h(
        'div',
        _objectSpread(
          {
            class: [this.suit()],
          },
          { attrs: { hidden: true } }
        ),
        allComponents
      );
    }

    return h(
      'div',
      { class: [this.suit()] },
      this.state.attributesToRender.map((attribute) =>
        components.get(attribute)
      )
    );
  }),
  computed: {
    widgetParams() {
      return {
        transformItems: this.transformItems,
        facets: this.facets,
        maxValuesPerFacet: this.maxValuesPerFacet,
        // we do not pass "widgets" to the connector, since Vue is in charge of rendering
        widgets: [],
      };
    },
  },
};
