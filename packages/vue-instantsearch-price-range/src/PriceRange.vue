<template>
  <div class="ais-price-range" v-show="show">

    <slot name="header"></slot>

    <span class="ais-price-range__currency ais-price-range__currency--left"
          v-if="currencyPlacement === 'left'"
    >
      {{ currency }}
    </span>
    <input class="ais-price-range__input ais-price-range__input--from"
           type="number"
           v-model="from"
           :placeholder="fromPlaceholder"
    >
    <span class="ais-price-range__currency ais-price-range__currency--right"
          v-if="currencyPlacement === 'right'"
    >
      {{ currency }}
    </span>

    <slot><span>to&nbsp;</span></slot>

    <span class="ais-price-range__currency ais-price-range__currency--left"
          v-if="currencyPlacement === 'left'"
    >
      {{ currency }}
    </span>
    <input class="ais-price-range__input ais-price-range__input--to"
           type="number"
           v-model="to"
           :placeholder="toPlaceholder"
    >
    <span class="ais-price-range__currency ais-price-range__currency--right"
          v-if="currencyPlacement === 'right'"
    >
      {{ currency }}
    </span>

    <slot name="footer"></slot>

  </div>
</template>

<script>
  import algoliaComponent from 'vue-instantsearch-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      fromPlaceholder: {
        type: String,
        default: "min"
      },
      toPlaceholder: {
        type: String,
        default: "max"
      },
      attributeName: {
        type: String,
        required: true
      },
      currency: {
        type: String,
        required: false,
        default: '$'
      },
      currencyPlacement: {
        type: String,
        required: false,
        default: 'left',
        validator: function (value) {
          return value === 'left' || value === 'right'
        }
      }
    },
    computed: {
      show () {
        return this.from || this.to || this.searchStore.totalResults > 0
      },
      from: {
        get () {
          for (let refinement in this.searchStore.activeRefinements) {
            if (this.searchStore.activeRefinements[refinement].attributeName === this.attributeName
              && this.searchStore.activeRefinements[refinement].type === 'numeric'
              && this.searchStore.activeRefinements[refinement].operator === '>') {

              return this.searchStore.activeRefinements[refinement].numericValue
            }
          }
          return
        },
        set (value) {
          value = Number(value)

          this.searchStore.stop()
          this.searchStore.removeNumericRefinement(this.attributeName, '>')
          if (value > 0) {
            this.searchStore.addNumericRefinement(this.attributeName, '>', value)
          }

          // Remove the max value if lower than the min value.
          if (value > Number(this.to)) {
            this.searchStore.removeNumericRefinement(this.attributeName, '<')
          }

          this.searchStore.start()
        }
      },
      to: {
        get () {
          for (let refinement in this.searchStore.activeRefinements) {
            if (this.searchStore.activeRefinements[refinement].attributeName === this.attributeName
              && this.searchStore.activeRefinements[refinement].type === 'numeric'
              && this.searchStore.activeRefinements[refinement].operator === '<') {
              return this.searchStore.activeRefinements[refinement].numericValue
            }
          }
          return
        },
        set (value) {
          value = Number(value)

          // Only update when `to` has reached the `from` value.
          if (value < Number(this.from)) {
            return
          }

          this.searchStore.stop()
          this.searchStore.removeNumericRefinement(this.attributeName, '<')
          if (value > 0) {
            this.searchStore.addNumericRefinement(this.attributeName, '<', value)
          }
          this.searchStore.start()
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .ais-price-range__input {
    width: 50px;
  }
</style>
