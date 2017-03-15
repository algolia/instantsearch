<template>
  <div id="app" class="container-fluid">

    <search-store appId="latency" apiKey="6be0576ff61c053d5f9a3225e2a90f76">
      <div class="row">
        <div class="col-md-2 col-sm-3">
          <h1 class="head-title">
            Demo Store
          </h1>
        </div>
        <div class="col-md-10 col-sm-9">
          <search-input placeholder="Search product by name or reference..."></search-input>

          <clear-search>
            <i class="fa fa-times-circle" aria-hidden="true"></i>
          </clear-search>
        </div>
      </div>

      <div class="row">
        <div class="col-md-2 col-sm-3">
          <navigation-tree-facet :attributes="['category', 'sub_category']">
            <div slot="header">
              <h3>Browse by</h3>
            </div>
          </navigation-tree-facet>

          <price-range-facet attribute="price">
            <div slot="header">
              <h3>Price</h3>
            </div>
          </price-range-facet>

          <search-facet attribute="materials">
            <div slot="header">
              <h3>Material</h3>
            </div>
          </search-facet>

          <search-facet attribute="colors">
            <div slot="header">
              <h3>Color</h3>
            </div>
          </search-facet>

          <rating-facet attribute="rating">
            <template scope="{value, min, max, count}">
              <template v-for="n in max">
                <span v-if="n <= value">&#9733</span>
                <span v-else>&#9734</span>
              </template>
              &amp; up ({{count}})
            </template>
          </rating-facet>

        </div>
        <div class="col-md-10 col-sm-9">
          <div class="search-controls">

            <sort-by-selector :indices="[
                {name: 'ikea', label: 'Relevance'},
                {name: 'ikea_price_asc', label: 'Lowest price'},
                {name: 'ikea_price_desc', label: 'Highest price'}
                ]"
            />

            <results-per-page-selector :options="[12, 24, 48]"/>

            <search-stats/>
          </div>

          <search-results>
            <template scope="{ hit }">
              <div class="search-result">
                <img class="hit__image img-responsive" :src="hit.image">

                <div class="hit__info">
                  <h2 class="hit__name" v-html="hit._highlightResult.name.value"></h2>
                  <div class="hit__type" v-html="hit._highlightResult.type.value"></div>
                  <div class="hit__rating">
                    <template v-for="n in 5">
                      <span v-if="n <= hit.rating" class="hit__star"></span>
                      <span v-else class="hit__star--empty"></span>
                    </template>
                  </div>
                  <div class="hit__price">${{hit.price}}</div>
                </div>
                <div class="clearfix"></div>
              </div>
            </template>
          </search-results>

          <empty-results>
            <template scope="{query}">This is my custom stuff <u>{{query}}</u></template>
          </empty-results>

          <div class="clearfix"></div>

          <div class="pagination-container">
            <ranged-pagination class="pagination"></ranged-pagination>
          </div>
        </div>
      </div>
    </search-store>

  </div>
</template>

<script>

  export default {
    name: 'app',
  }
</script>


<style lang="scss" rel="stylesheet/scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* text-align: center; */
    color: #2c3e50;
    width: 1400px;
    margin: auto;
  }

  .alg-search-input {
    width: 100%;
    outline: none;
    font-size: 15px;
    padding: 7px;
    box-sizing: border-box;
    border: 2px solid lightgrey;
    border-radius: 2px;
    margin: 20px 0;
    margin-right: 5%;
  }

  .search-controls {
    padding-bottom: 20px;
  }

  .search-result {
    padding: 10px 20px 20px;
    width: 24%;
    margin-bottom: 10px;
    border: solid 1px #EEE;
    box-shadow: 0 0 3px #f6f6f6;
    margin-right: 1%;
    position: relative;
    border-radius: 3px;
    min-width: 220px;
    background: #FFF;

    display: inline;
    float: left;
    transition: all .5s;
  }

  .hit__info {
    position: absolute;
    width: 100%;
    padding: 0px 20px 20px;
    bottom: 0;
    left: 0;
  }

  .hit__image {
    margin-bottom: 100px;
  }

  .hit__name {
    font-size: 14px;
    font-weight: bold;
  }

  .hit__name em, .hit__type em {
    font-style: normal;
    background: rgba(143, 187, 237, .1);
    box-shadow: inset 0 -1px 0 0 rgba(69, 142, 225, .8);
  }

  .hit__type em {
    background: rgba(143, 187, 237, .1);
    border-radius: 0;
    box-shadow: inset 0 -1px 0 0 rgba(69, 142, 225, .8);
  }

  .hit__price {
    font-size: 25px;
    font-weight: bold;
    position: absolute;
    right: 20px;
    bottom: 16px;
  }

  .hit__type {
    color: #a2a2a2;
    font-size: 12px;
  }

  .hit__rating {
    margin-top: 10px;
  }

  .hit__star {
    width: 1em;
    height: 1em;
  }

  .hit__star:before {
    content: '\2605';
    color: #FBAE00;
  }

  .hit__star--empty:before {
    content: '\2606';
    color: #FBAE00;
  }

  /* Sort by selector */
  .alg-sort-by-selector {
    float: right;
  }

  .alg-hpp-selector {
    float: right;
    margin-right: 10px;
  }

  /* Navigation tree */
  .alg-navigation-tree-facet {

    label {
      font-weight: normal;
      cursor: pointer;

      &:hover {

        .alg-navigation-tree-facet__value {
          text-decoration: underline;
        }

      }
    }
    ul {
      list-style: none;
      padding-left: 0;

      ul {
        padding-left: 20px;
      }

    }
    .alg-navigation-tree-facet__item--active > label {
      font-weight: bold;
    }

  }

  /* Search Facet */
  .alg-search-facet {

    label {
      font-weight: normal;
      cursor: pointer;

      &:hover {

        .alg-search-facet__value {
          text-decoration: underline;
        }

      }
    }
    ul {
      list-style: none;
      padding-left: 0;
    }

    .alg-search-facet__item--active label {
      font-weight: bold;
    }

  }

  /* Rating Facet */
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

  /* Clear Search */
  .alg-clear-search {
    background: none;
    border: none;
    position: absolute;
    top: 25px;
    right: 25px;
    cursor: pointer;

    .fa-times-circle {
      color: lightgrey;
      font-size: 25px;
      vertical-align: middle;
    }

    &.alg-clear-search--disabled {
      display: none;
    }

  }

  /* Price Range */
  .alg-price-range {

    .alg-price-range__input {
      width: 50px;
    }

  }

  /* Ranged Pagination */
  .alg-ranged-pagination {
    list-style: none;
    padding-left: 0;

    li {
      display: inline-block;

      label {
        padding: 10px;
      }

    }

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
    .alg-ranged-pagination__item--active label {
      font-weight: bold;
    }

    .alg-ranged-pagination__item--disabled, .alg-ranged-pagination__item--active {

      label:hover {
        text-decoration: none;
        cursor: default;
      }

    }
  }

</style>
