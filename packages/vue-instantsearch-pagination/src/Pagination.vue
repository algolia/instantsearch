<template>
  <ul class="alg-ranged-pagination">
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--first"
        :class="{'alg-ranged-pagination__item--disabled': page === 1}"
    >
      <button type="button" @click="goToFirstPage" :disabled="page === 1">
        <slot name="first">&lt;&lt;</slot>
      </button>
    </li>
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--previous"
        :class="{'alg-ranged-pagination__item--disabled': page === 1}"
    >
      <button type="button" @click="goToPreviousPage" :disabled="page === 1">
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
          {{ item }}
        </slot>
      </label>
    </li>
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--next"
        :class="{'alg-ranged-pagination__item--disabled': page >= totalPages }"
    >
      <button type="button" @click="goToNextPage" :disabled="page >= totalPages">
        <slot name="next">&gt;</slot>
      </button>
    </li>
    <li class="alg-ranged-pagination__item alg-ranged-pagination__item--last"
        :class="{'alg-ranged-pagination__item--disabled': page >= totalPages }"
    >
      <button type="button" @click="goToLastPage" :disabled="page >= totalPages">
        <slot name="last">&gt;&gt;</slot>
      </button>
    </li>
  </ul>
</template>

<script>
  import algoliaComponent from 'vue-instantsearch-component'

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

<style lang="scss" rel="stylesheet/scss">
  /* Ranged Pagination */
  .alg-ranged-pagination {
    list-style: none;
    padding-left: 0;

    li {
      display: inline-block;
    }

    input {
      display: none;
    }

    label {
      font-weight: normal;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }

    }

    button {
      border: none;
      background: none;
      &:hover {
        text-decoration: underline;
      }
    }

    &__item--disabled button:hover {
      text-decoration: none;
    }

    &__item--active label {
      font-weight: bold;
    }

    &__item--disabled, &__item--active {

      label:hover {
        text-decoration: none;
        cursor: default;
      }

    }

  }
</style>
