<template>
  <ul class="alg-ranged-pagination">
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--first"
        :class="{'alg-ranged-pagination__item--disabled': page === 0}"
    >
      <button type="button" @click="goToFirstPage" :disabled="page === 0">
        <slot name="first">&lt;&lt;</slot>
      </button>
    </li>
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--previous"
        :class="{'alg-ranged-pagination__item--disabled': page === 0}"
    >
      <button type="button" @click="goToPreviousPage" :disabled="page === 0">
        <slot name="previous">&lt;</slot>
      </button>
    </li>
    <li
        v-for="item in pages"
        class="alg-ranged-pagination__item"
        :class="{ 'alg-ranged-pagination__item--active': item === page }"
    >
      <label>
        <input type="radio"
               :name="name"
               :value="item"
               v-model="page"
               @change="goToPage(item)"
        >
        <slot :value="item" :active="item === page">
          {{ item + 1 }}
        </slot>
      </label>
    </li>
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--next"
        :class="{'alg-ranged-pagination__item--disabled': page >= totalPages - 1 }"
    >
      <button type="button" @click="goToNextPage" :disabled="page >= totalPages - 1">
        <slot name="next">&gt;</slot>
      </button>
    </li>
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--last"
        :class="{'alg-ranged-pagination__item--disabled': page >= totalPages - 1 }"
    >
      <button type="button" @click="goToLastPage" :disabled="page >= totalPages - 1">
        <slot name="last">&gt;&gt;</slot>
      </button>
    </li>
  </ul>
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      name: {
        type: String,
        default: 'page'
      },
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
            if (firstPage <= 0) {
              continue
            }
            firstPage--
            pages.unshift(firstPage)
          } else {
            if (lastPage >= this.totalPages - 1) {
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
        page = Math.min(this.totalPages - 1, page)
        this.searchStore.page = page
      },
      goToFirstPage () {
        this.goToPage(0)
      },
      goToPreviousPage () {
        this.goToPage(this.page - 1)
      },
      goToNextPage () {
        this.goToPage(this.page + 1)
      },
      goToLastPage () {
        this.goToPage(this.totalPages - 1)
      }
    }
  }
</script>
