<template>
  <div class="ais-refinement-list" v-if="show">
    <slot name="header"></slot>

    <ul>
      <li v-for="facet in facetValues"
          class="ais-refinement-list__item"
          :class="{'ais-refinement-list__item--active': facet.isRefined}"
      >
        <label>
          <input type="checkbox"
                 v-model="facet.isRefined"
                 @change="toggleRefinement(facet)"
                 :value="facet.name"
          >

          <slot :count="facet.count" :active="facet.isRefined" :value="facet.name">
            <span class="ais-refinement-list__value">{{facet.name}}</span>
            <span class="ais-refinement-list__count">({{facet.count}})</span>
          </slot>
        </label>
      </li>
    </ul>

    <slot name="footer"></slot>
  </div>
</template>

<script>
  import {FACET_OR, FACET_AND} from 'instantsearch-store'
  import algoliaComponent from 'vue-instantsearch-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      attributeName: {
        type: String,
        required: true
      },
      operator: {
        type: String,
        default: FACET_OR,
        validator (value) {
          value = value.toLowerCase()

          return value === FACET_OR || value === FACET_AND;
        }
      },
      limit: {
        type: Number,
        default: 10
      },
      sortBy: {
        default () {
          return ['isRefined:desc', 'count:desc', 'name:asc']
        }
      }
    },
    mounted () {
      this.searchStore.addFacet(this.attributeName, this.operator)
    },
    destroyed () {
      this.searchStore.removeFacet(this.attributeName)
    },
    computed: {
      facetValues () {
        return this.searchStore.getFacetValues(this.attributeName, this.sortBy, this.limit)
      },
      show () {
        return this.facetValues.length > 0
      }
    },
    methods: {
      toggleRefinement: function (value) {
        return this.searchStore.toggleFacetRefinement(this.attributeName, value.name)
      }
    },
    watch: {
      operator (value) {
        this.searchStore.addFacet(this.attributeName, this.operator)
      }
    }
  }
</script>

