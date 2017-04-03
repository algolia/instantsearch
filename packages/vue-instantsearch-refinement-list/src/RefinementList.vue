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
                 :name="name"
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

<style lang="scss" rel="stylesheet/scss">
  .ais-refinement-list {

    label {
      font-weight: normal;
      cursor: pointer;

      &:hover .ais-refinement-list__value {
        text-decoration: underline;
      }

    }

    ul {
      list-style: none;
      padding-left: 0;
    }

    &__item--active label {
      font-weight: bold;
    }

  }
</style>

