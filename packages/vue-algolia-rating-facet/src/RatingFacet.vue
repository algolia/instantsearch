<template>
  <div class="alg-rating-facet" v-if="isVisible">
    <slot name="header"></slot>

    <button class="alg-rating-facet__clear"
            type="button"
            @click="clear"
            v-if="currentValue"
    >
      <slot name="clear">Clear</slot>
    </button>

    <ul>
      <li v-for="facet in facetValues"
          class="alg-rating-facet__item"
          :class="{'alg-rating-facet__item--active': facet.isRefined}"
      >
        <label>
          <input type="radio"
                 :value="facet.value"
                 v-model="currentValue"
                 @change="toggleRefinement(facet)"
                 :name="name"
          >
          <slot :value="facet.value"
                :min="min"
                :max="max"
                :count="facet.count"
          >
            <template v-for="n in max">
              <span v-if="n <= facet.value" class="alg-rating-facet__star">&#9733</span>
              <span v-else class="alg-rating-facet__star alg-rating-facet__star--empty">&#9734</span>
            </template>
            &nbsp;&amp; up
            <span class="alg-rating-facet__count">({{facet.count}})</span>
          </slot>
        </label>
      </li>
    </ul>

    <slot name="footer"></slot>
  </div>
</template>

<script>
  import {FACET_OR} from 'algolia-search-store'
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      name: {
        type: String,
        default: "rating"
      },
      attribute: {
        type: String,
        required: true
      },
      min: {
        type: Number,
        default: 1
      },
      max: {
        type: Number,
        default: 5
      }
    },
    mounted: function () {
      this.searchStore.addFacet(this.attribute, FACET_OR)
    },
    destroyed: function () {
      this.searchStore.removeFacet(this.attribute)
    },
    computed: {
      isVisible: function () {
        for (let value in this.facetValues) {
          if (this.facetValues[value].count > 0) {
            return true
          }
        }
        return false
      },
      facetValues: function () {
        const values = this.searchStore.getFacetValues(this.attribute, ['name:asc'], this.max + 1)

        let stars = []
        let isRefined = false

        for (let i = 0; i <= this.max; i++) {
          let name = i.toString()
          let star = {
            count: 0,
            isRefined: false,
            name: name,
            value: i
          }

          for (let value in values) {
            if (values[value].name === name) {
              if (!isRefined && values[value].isRefined) {
                isRefined = true
                star.isRefined = true
              }
            }
          }

          stars.push(star)
        }

        stars = stars.reverse()

        let count = 0
        for (let index in stars) {
          stars[index].count = count
          for (let value in values) {
            if (values[value].name === stars[index].name) {
              count += values[value].count
              stars[index].count = count
            }
          }
        }

        return stars.slice(this.min, this.max)
      },
      currentValue () {
        for (let value in this.facetValues) {
          if (this.facetValues[value].isRefined) {
            return this.facetValues[value].value
          }
        }

        return
      }
    },
    methods: {
      toggleRefinement (facet) {
        if (facet.isRefined) {
          return this.searchStore.clearRefinements(this.attribute)
        }

        if (facet.count === 0) {
          return
        }

        this.searchStore.stop()
        this.searchStore.clearRefinements(this.attribute)
        for (let val = Number(facet.name); val <= this.max; ++val) {
          this.searchStore.addFacetRefinement(this.attribute, val);
        }
        this.searchStore.start()
      },
      clear () {
        this.searchStore.clearRefinements(this.attribute)
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .alg-rating-facet {

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
    ul {
      list-style: none;
      padding-left: 0;
    }

    .alg-rating-facet__item--active label {
      font-weight: bold;

      &:hover {
        text-decoration: none;
        cursor: default;
      }

    }

    .alg-rating-facet__clear {
      border: none;
      background: none;
      padding-left: 0;

      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }

      &:before {
        content: '< ';
      }

    }

  }
</style>


