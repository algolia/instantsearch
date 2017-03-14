<template>
  <div class="alg-search-results">
    <slot v-for="hit in hits" :hit="hit">
      Result 'objectID': {{ hit.objectID }}
    </slot>
  </div>
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      stack: {
        type: Boolean,
        default: false
      },
      hitsPerPage: {
        type: Number
      }
    },
    mounted () {
      this.pushHitsPerPage()
    },
    watch: {
      hitsPerPage () {
        this.pushHitsPerPage()
      }
    },
    methods: {
      pushHitsPerPage () {
        if (typeof this.hitsPerPage === 'number' && this.hitsPerPage > 0) {
          this.searchStore.hitsPerPage = this.hitsPerPage
        }
      }
    },
    computed: {
      hits () {
        if (this.stack === false) {
          return this.searchStore.hits
        }

        if (typeof this.stackedHits === 'undefined') {
          this.stackedHits = []
        }

        if (this.searchStore.page === 0) {
          this.stackedHits = []
        }

        if (this.stackedHits.length === 0 || this.searchStore.hits.length === 0) {
          this.stackedHits.push(...this.searchStore.hits)
        } else {
          const lastStacked = this.stackedHits[this.stackedHits.length - 1]
          const lastHit = this.searchStore.hits[this.searchStore.hits.length - 1]

          if (lastStacked['objectID'] !== lastHit['objectID']) {
            this.stackedHits.push(...this.searchStore.hits)
          }
        }

        return this.stackedHits
      }
    }
  }
</script>
