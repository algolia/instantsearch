<template>
  <div class="alg-search-facet" v-if="facetValues.length > 0">
    <slot name="header"></slot>

    <ul>
      <li v-for="facet in facetValues"
          class="alg-search-facet__item"
          :class="{'alg-search-facet__item--active': facet.isRefined}"
      >
        <label>
          <input type="checkbox"
                 :name="name"
                 v-model="facet.isRefined"
                 @change="toggleRefinement(facet)"
                 :value="facet.name"
          >
          <span class="alg-search-facet__value">{{facet.name}}</span>
          <span class="alg-search-facet__count">({{facet.count}})</span>
        </label>
      </li>
    </ul>

    <slot name="footer"></slot>
  </div>
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      attribute: {
        type: String,
        required: true
      },
      name: {
        type: String,
        default () {
          return this.attribute
        }
      },
      useAnd: {
        type: Boolean,
        default: false
      },
      limit: {
        type: Number,
        default: 10
      },
      sortBy: {
        default: function () {
          return ['isRefined:desc', 'count:desc', 'name:asc']
        }
      },
      multi: {
        type: Boolean,
        default: true
      }
    },
    mounted: function () {
      const facetType = this.useAnd ? 'conjunctive' : 'disjunctive'
      this.searchStore.addFacet(this.attribute, facetType)
    },
    destroyed: function () {
      this.searchStore.removeFacet(this.attribute)
    },
    computed: {
      facetValues: function () {
        return this.searchStore.getFacetValues(this.attribute, this.sortBy, this.limit)
      }
    },
    methods: {
      toggleRefinement: function (value) {
        if (value.isRefined || this.multi) {
          return this.searchStore.toggleFacetRefinement(this.attribute, value.name)
        }

        this.searchStore.stop()
        this.searchStore.clearRefinements(this.attribute)
        this.searchStore.toggleFacetRefinement(this.attribute, value.name)
        this.searchStore.start()
      }
    },
    watch: {
      operator: function (value) {
        const facetType = this.useAnd ? 'conjunctive' : 'disjunctive'
        this.searchStore.addFacet(this.attribute, facetType)
      }
    }
  }
</script>

