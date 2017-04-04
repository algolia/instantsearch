<template>
  <div id="app" class="container-fluid">
    <ais-store appId="latency" apiKey="6be0576ff61c053d5f9a3225e2a90f76">
      <div class="row">
        <div class="col-md-2 col-sm-3">
          <h1 class="head-title">
            Demo Store
          </h1>
        </div>
        <div class="col-md-10 col-sm-9">
          <ais-input placeholder="Search product by name or reference..." />

          <ais-clear>
            <i class="fa fa-times-circle" aria-hidden="true"></i>
          </ais-clear>
        </div>
      </div>

      <div class="row">
        <div class="col-md-2 col-sm-3">
          <ais-navigation-tree :attributes="['category', 'sub_category']">
            <h3 slot="header">Browse by</h3>
          </ais-navigation-tree>

          <ais-price-range attribute="price">
            <h3 slot="header">Price</h3>
          </ais-price-range>

          <ais-refinement-list attribute="materials">
            <h3 slot="header">Material</h3>
          </ais-refinement-list>

          <ais-refinement-list attribute="colors">
            <h3 slot="header">Color</h3>
          </ais-refinement-list>

          <ais-rating attribute="rating">
            <h3 slot="header">Rating</h3>
          </ais-rating>

        </div>
        <div class="col-md-10 col-sm-9">
          <div class="search-controls">


            <ais-sort-by-selector :indices="[
                {name: 'ikea', label: 'Relevance'},
                {name: 'ikea_price_asc', label: 'Lowest price'},
                {name: 'ikea_price_desc', label: 'Highest price'}
                ]"
            />

            <ais-results-per-page-selector :options="[12, 24, 48]"/>

            <ais-powered-by />

            <ais-stats/>

          </div>

          <ais-results>
            <template scope="{ result }">
              <div class="search-result">
                <img class="result__image img-responsive" :src="result.image">

                <div class="result__info">
                  <h2 class="result__name">
                    <ais-highlight :result="result" attribute-name="name"/>
                  </h2>
                  <div class="result__type">
                    <ais-highlight :result="result" attribute-name="type"/>
                  </div>
                  <div class="result__rating">
                    <template v-for="n in 5">
                      <span v-if="n <= result.rating" class="result__star"></span>
                      <span v-else class="result__star--empty"></span>
                    </template>
                  </div>
                  <div class="result__price">${{result.price}}</div>
                </div>
              </div>
            </template>
          </ais-results>

          <ais-no-results/>

          <ais-pagination class="pagination"/>

        </div>
      </div>
    </ais-store>

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
    color: #2c3e50;
    width: 1400px;
    margin: auto;
  }

  .ais-input {
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

  .ais-powered-by {
    float: right;
    margin-right: 10px;
    svg {
      vertical-align: bottom;
    }
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

  .result__info {
    position: absolute;
    width: 100%;
    padding: 0px 20px 20px;
    bottom: 0;
    left: 0;
  }

  .result__image {
    margin-bottom: 100px;
  }

  .result__name {
    font-size: 14px;
    font-weight: bold;
  }

  .result__name em, .result__type em {
    font-style: normal;
    background: rgba(143, 187, 237, .1);
    box-shadow: inset 0 -1px 0 0 rgba(69, 142, 225, .8);
  }

  .result__type em {
    background: rgba(143, 187, 237, .1);
    border-radius: 0;
    box-shadow: inset 0 -1px 0 0 rgba(69, 142, 225, .8);
  }

  .result__price {
    font-size: 25px;
    font-weight: bold;
    position: absolute;
    right: 20px;
    bottom: 16px;
  }

  .result__type {
    color: #a2a2a2;
    font-size: 12px;
  }

  .result__rating {
    margin-top: 10px;
  }

  .result__star {
    width: 1em;
    height: 1em;
  }

  .result__star:before {
    content: '\2605';
    color: #FBAE00;
  }

  .result__star--empty:before {
    content: '\2606';
    color: #FBAE00;
  }

  /* Sort by selector */
  .ais-sort-by-selector {
    float: right;
  }

  .ais-results-per-page-selector {
    float: right;
    margin-right: 10px;
  }

  /* Clear Search */
  .ais-clear {
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

    &.ais-clear--disabled {
      display: none;
    }
  }

  /* Ranged Pagination */
  .ais-pagination li label{
    padding: 10px;
  }

  /* Search Facet */
  .ais-refinement-list label input {
    margin-right: 5px;
  }
</style>
