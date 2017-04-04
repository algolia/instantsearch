<template>
  <ul class="ais-pagination">
    <li class="ais-pagination__item ais-pagination__item--first"
        :class="{'ais-pagination__item--disabled': page === 1}"
    >
      <a href="#" @click.prevent="goToFirstPage">
        <slot name="first">&lt;&lt;</slot>
      </a>
    </li>
    <li class="ais-pagination__item ais-pagination__item--previous"
        :class="{'ais-pagination__item--disabled': page === 1}"
    >
      <a href="#" @click.prevent="goToPreviousPage">
        <slot name="previous">&lt;</slot>
      </a>
    </li>
    <li
        v-for="item in pages"
        class="ais-pagination__item"
        :class="{ 'ais-pagination__item--active': item === page }"
    >
      <a href="#" @click.prevent="goToPage(item)">
        <slot :value="item" :active="item === page">
          {{ item }}
        </slot>
      </a>
    </li>
    <li class="ais-pagination__item ais-pagination__item--next"
        :class="{'ais-pagination__item--disabled': page >= totalPages }"
    >
      <a href="#" @click.prevent="goToNextPage">
        <slot name="next">&gt;</slot>
      </a>
    </li>
    <li class="ais-pagination__item ais-pagination__item--last"
        :class="{'ais-pagination__item--disabled': page >= totalPages }"
    >
      <a href="#" @click.prevent="goToLastPage">
        <slot name="last">&gt;&gt;</slot>
      </a>
    </li>
  </ul>
</template>

<script>
  import algoliaComponent from 'vue-instantsearch-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      padding: {
        type: Number,
        default: 3,
        validator (value) {
          return value > 0
        }
      }
    },
    computed: {
      page () {
        return this.searchStore.page
      },
      totalPages () {
        return this.searchStore.totalPages
      },
      pages () {
        let maxPages = this.padding * 2
        if (this.totalPages - 1 < maxPages) {
          maxPages = this.totalPages - 1
        }

        let pages = [this.page]
        let even = false
        let lastPage = this.page
        let firstPage = this.page
        while (pages.length <= maxPages) {
          even = !even
          if (even) {
            if (firstPage <= 1) {
              continue
            }
            firstPage--
            pages.unshift(firstPage)
          } else {
            if (lastPage >= this.totalPages) {
              continue
            }
            lastPage++
            pages.push(lastPage)
          }
        }

        return pages
      }
    },
    methods: {
      goToPage (page) {
        page = Math.min(this.totalPages, page)
        this.searchStore.page = page
      },
      goToFirstPage () {
        this.goToPage(1)
      },
      goToPreviousPage () {
        this.goToPage(this.page - 1)
      },
      goToNextPage () {
        this.goToPage(this.page + 1)
      },
      goToLastPage () {
        this.goToPage(this.totalPages)
      }
    }
  }
</script>
