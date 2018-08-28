<template functional>
  <ul
    :class="[
      props.suit('list'),
      props.level > 0 && props.suit('list', 'child'),
      props.suit('list', `lvl${props.level}`)
    ]"
  >
    <li
      v-for="item in props.items"
      :key="item.value"
      :class="[
        props.suit('item'),
        item.data && props.suit('item', 'parent'),
        item.isRefined && props.suit('item', 'selected')
      ]"
    >
      <a
        :href="props.createURL(item.value)"
        :class="props.suit('link')"
        @click.prevent="props.refine(item.value)"
      >
        <span :class="props.suit('label')">{{ item.label }}</span>
        <span :class="props.suit('count')">{{ item.count }}</span>
      </a>

      <hierarchical-menu-list
        v-if="item.data"
        :items="item.data"
        :level="props.level + 1"
        :suit="props.suit"
        :refine="props.refine"
        :createURL="props.createURL"
      />
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    suit: {
      type: Function,
      required: true,
    },
    refine: {
      type: Function,
      required: true,
    },
    createURL: {
      type: Function,
      required: true,
    },
  },
};
</script>
