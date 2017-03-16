<template>
  <div class="alg-search-facet" v-if="show">
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

          <slot :count="facet.count" :active="facet.isRefined" :value="facet.name">
            <span class="alg-search-facet__value">{{facet.name}}</span>
            <span class="alg-search-facet__count">({{facet.count}})</span>
          </slot>
        </label>
      </li>
    </ul>

    <slot name="footer"></slot>
  </div>
</template>

<script>
  import {FACET_OR, FACET_AND} from 'algolia-search-store'
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
      this.searchStore.addFacet(this.attribute, this.operator)
    },
    destroyed () {
      this.searchStore.removeFacet(this.attribute)
    },
    computed: {
      facetValues () {
        return this.searchStore.getFacetValues(this.attribute, this.sortBy, this.limit)
      },
      show () {
        return this.facetValues.length > 0
      }
    },
    methods: {
      toggleRefinement: function (value) {
        return this.searchStore.toggleFacetRefinement(this.attribute, value.name)
      }
    },
    watch: {
      operator (value) {
        this.searchStore.addFacet(this.attribute, this.operator)
      }
    }
  }
</script>

