<template>
  <ul class="alg-ranged-pagination">
    <li
        v-for="item in items"
        class="alg-ranged-pagination__item"
        :class="{
              'alg-ranged-pagination__item--disabled': item.disabled,
              'alg-ranged-pagination__item--active': !item.disabled && item.value === page
            }"
    >
      <label>
        <input type="radio"
               :name="name"
               :value="item.value"
               :disabled="item.disabled"
               v-model="page"
               @change="goToPage(item.value)"
        >
        {{ item.label }}
      </label>
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
      nbPages () {
        return this.searchStore.nbPages
      },
      items () {
        const items = []
        const pages = this.pages

        // First page.
        items.push({
          disabled: this.page === 0,
          value: 0,
          label: '<<',
        })

        // Previous page.
        items.push({
          disabled: this.page === 0,
          value: Math.max(0, this.page - 1),
          label: '<',
        })

        // All pages in range.
        for (let key in pages) {
          const page = pages[key]
          items.push({
            disabled: false,
            value: page,
            label: page + 1,
          })
        }

        // Next page.
        items.push({
          disabled: this.page >= this.nbPages - 1,
          value: this.page + 1,
          label: '>',
        })

        // Last page.
        items.push({
          disabled: this.page >= this.nbPages - 1,
          value: this.nbPages,
          label: '>>',
        })

        return items
      },
      pages () {
        let maxPages = this.padding * 2
        if (this.nbPages - 1 < maxPages) {
          maxPages = this.nbPages - 1
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
            if (lastPage >= this.nbPages - 1) {
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
        page = Math.min(this.nbPages - 1, page)
        this.searchStore.page = page
      }
    }
  }
</script>
