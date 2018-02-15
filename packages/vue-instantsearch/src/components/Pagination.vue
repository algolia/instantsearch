<template>
  <ul :class="bem()" v-show="totalResults > 0">
    <li :class="[bem('item', 'first'), page === 1 ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToFirstPage" :class="bem('link')">
        <slot name="first">&lt;&lt;</slot>
      </a>
    </li>
    <li :class="[bem('item', 'previous'), page === 1 ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToPreviousPage" :class="bem('link')">
        <slot name="previous">&lt;</slot>
      </a>
    </li>
    <li v-for="item in pages" :key="item" :class="[bem('item'), page === item ? bem('item', 'active', false) : '']" >
      <a href="#" @click.prevent="goToPage(item)" :class="bem('link')">
        <slot :value="item" :active="item === page">
          {{ item }}
        </slot>
      </a>
    </li>
    <li :class="[bem('item', 'next'), page >= totalPages ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToNextPage" :class="bem('link')">
        <slot name="next">&gt;</slot>
      </a>
    </li>
    <li :class="[bem('item', 'last'), page >= totalPages ? bem('item', 'disabled', false) : '']">
      <a href="#" @click.prevent="goToLastPage" :class="bem('link')">
        <slot name="last">&gt;&gt;</slot>
      </a>
    </li>
  </ul>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    padding: {
      type: Number,
      default: 3,
      validator(value) {
        return value > 0;
      },
    },
  },
  data() {
    return {
      blockClassName: 'ais-pagination',
    };
  },
  computed: {
    page() {
      return this.searchStore.page;
    },
    totalPages() {
      return this.searchStore.totalPages;
    },
    pages() {
      let maxPages = this.padding * 2;
      if (this.totalPages - 1 < maxPages) {
        maxPages = this.totalPages - 1;
      }

      const pages = [this.page];
      let even = false;
      let lastPage = this.page;
      let firstPage = this.page;
      while (pages.length <= maxPages) {
        even = !even;
        if (even) {
          if (firstPage <= 1) {
            continue; // eslint-disable-line no-continue
          }
          firstPage--;
          pages.unshift(firstPage);
        } else {
          if (lastPage >= this.totalPages) {
            continue; // eslint-disable-line no-continue
          }
          lastPage++;
          pages.push(lastPage);
        }
      }

      return pages;
    },
    totalResults() {
      return this.searchStore.totalResults;
    },
  },
  methods: {
    goToPage(page) {
      let p = Math.max(1, page);
      p = Math.min(this.totalPages, p);
      if (this.searchStore.page === p) {
        return;
      }
      this.searchStore.page = p;
      this.$emit('page-change', p);
    },
    goToFirstPage() {
      this.goToPage(1);
    },
    goToPreviousPage() {
      this.goToPage(this.page - 1);
    },
    goToNextPage() {
      this.goToPage(this.page + 1);
    },
    goToLastPage() {
      this.goToPage(this.totalPages);
    },
  },
};
</script>
