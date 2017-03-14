<template>
  <div class="alg-navigation-tree-facet" v-if="facetValues.length > 0">
    <slot name="header"></slot>

    <ul v-if="facetValues.length > 0">
      <li v-for="facet in facetValues"
          class="alg-navigation-tree-facet__item"
          :class="{'alg-navigation-tree-facet__item--active': facet.isRefined}"
      >
        <label>
          <input type="checkbox"
                 v-model="facet.isRefined"
                 @change="toggleRefinement(facet)"
                 :value="facet.name"
                 :name="name + '[]'"
          >
          <span class="alg-navigation-tree-facet__value">{{facet.name}}</span>
          <span class="alg-navigation-tree-facet__count">({{facet.count}})</span>
        </label>

        <template v-if="facet.isRefined && facet.data.length > 0">
          <ul>
            <li v-for="subfacet in facet.data"
                class="alg-navigation-tree-facet__item"
                :class="{'alg-navigation-tree-facet__item--active': subfacet.isRefined}"
            >
              <label>
                <input type="checkbox"
                       v-model="subfacet.isRefined"
                       @change="toggleRefinement(subfacet)"
                       :value="subfacet.name"
                       :name="name + '[]'"
                >
                <span class="alg-navigation-tree-facet__value">{{subfacet.name}}</span>
                <span class="alg-navigation-tree-facet__count">({{subfacet.count}})</span>
              </label>
            </li>
          </ul>
        </template>

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
      name: {
        type: String,
        default () {
          return this.attribute
        }
      },
      attribute: {
        type: String,
        required: false,
        default: 'hierarchical_list'
      },
      attributes: {
        type: Array,
        required: true
      },
      separator: {
        type: String,
        required: false,
        default: ' > '
      },
      limit: {
        type: Number,
        default: 10
      },
      sortBy: {
        default () {
          return ['name:asc']
        }
      }
    },
    mounted () {
      this.searchStore.addFacet({
        name: this.attribute,
        attributes: this.attributes,
        separator: this.separator
      }, 'hierarchical')
    },
    destroyed () {
      this.searchStore.removeFacet(this.attribute)
    },
    computed: {
      facetValues () {
        let values = this.searchStore.getFacetValues(this.attribute, this.sortBy)

        return values.data || []
      }
    },
    methods: {
      toggleRefinement (value) {
        return this.searchStore.toggleFacetRefinement(this.attribute, value.path)
      }
    }
  }
</script>
