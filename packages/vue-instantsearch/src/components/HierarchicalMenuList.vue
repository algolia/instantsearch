<template>
  <ul
    :class="[
      suit('list'),
      level > 0 && suit('list', 'child'),
      suit('list', `lvl${level}`)
    ]"
  >
    <li
      v-for="item in items"
      :key="item.value"
      :class="[
        suit('item'),
        item.data && suit('item', 'parent'),
        item.isRefined && suit('item', 'selected')
      ]"
    >
      <a
        :href="createURL(item.value)"
        :class="suit('link')"
        @click.prevent="refine(item.value)"
      >
        <span :class="suit('label')">{{ item.label }}</span>
        <span :class="suit('count')">{{ item.count }}</span>
      </a>

      <hierarchical-menu-list
        v-if="item.data"
        :items="item.data"
        :level="level + 1"
        :refine="refine"
        :createURL="createURL"
        :suit="suit"
      />
    </li>
  </ul>
</template>

<script>
export default {
  name: 'HierarchicalMenuList',
  props: {
    items: {
      type: Array,
      required: true,
    },
    level: {
      type: Number,
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
    suit: {
      type: Function,
      required: true,
    },
  },
};
</script>
