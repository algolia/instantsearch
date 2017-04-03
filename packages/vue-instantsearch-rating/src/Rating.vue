<template>
  <div class="ais-rating" v-if="show">
    <slot name="header"></slot>

    <button class="ais-rating__clear"
            type="button"
            @click="clear"
            v-if="currentValue"
    >
      <slot name="clear">Clear</slot>
    </button>

    <ul>
      <li v-for="facet in facetValues"
          class="ais-rating__item"
          :class="{'ais-rating__item--active': facet.isRefined}"
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
              <span v-if="n <= facet.value" class="ais-rating__star">&#9733</span>
              <span v-else class="ais-rating__star ais-rating__star--empty">&#9734</span>
            </template>
            &nbsp;&amp; up
            <span class="ais-rating__count">({{facet.count}})</span>
          </slot>
        </label>
      </li>
    </ul>

    <slot name="footer"></slot>
  </div>
</template>

<script>
  import {FACET_OR} from 'instantsearch-store'
  import algoliaComponent from 'vue-instantsearch-component'

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
    mounted () {
      this.searchStore.addFacet(this.attribute, FACET_OR)
    },
    destroyed () {
      this.searchStore.removeFacet(this.attribute)
    },
    computed: {
      show () {
        for (let value in this.facetValues) {
          if (this.facetValues[value].count > 0) {
            return true
          }
        }
        return false
      },
      facetValues () {
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
  .ais-rating {

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

    &__item--active label {
      font-weight: bold;

      &:hover {
        text-decoration: none;
        cursor: default;
      }

    }

    &__clear {
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


