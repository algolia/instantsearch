<template>
  <div id="app" class="container-fluid">
    <ais-index appId="latency" apiKey="6be0576ff61c053d5f9a3225e2a90f76">
      <div class="row">
        <div class="col-md-2 col-sm-3">
          <h1 class="head-title">
            Demo Store
          </h1>
        </div>
        <div class="col-md-10 col-sm-9">
          <ais-search-box>
            <div class="input-group">
              <ais-input
              placeholder="Search product by name or reference..."
              :classNames="{
                'ais-input': 'form-control'
                }"
              />

              <span class="input-group-btn">
                <ais-clear :classNames="{'ais-clear': 'btn btn-default'}">
                  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </ais-clear>
                <button class="btn btn-default" type="submit">
                  <span class="glyphicon glyphicon-search" aria-hidden="true"></span>
                </button>
              </span>
            </div><!-- /input-group -->

          </ais-search-box>



        </div>
      </div>

      <div class="row">
        <div class="col-md-2 col-sm-3">
          <ais-tree-menu :attributes="['category', 'sub_category']" :classNames="{
            'ais-tree-menu__list': 'list-unstyled',
            'ais-tree-menu__count': 'badge'
            }">
            <h3 slot="header">Browse by</h3>
          </ais-tree-menu>


          <ais-price-range attribute-name="price" :classNames="{
            'ais-price-range__input': 'form-control'
            }">
            <h3 slot="header">Price</h3>
          </ais-price-range>


          <ais-refinement-list attribute-name="materials" :classNames="{
            'ais-refinement-list__count': 'badge',
            'ais-refinement-list__item': 'checkbox'
            }">
            <h3 slot="header">Material</h3>
          </ais-refinement-list>

          <ais-refinement-list attribute-name="colors" :classNames="{
            'ais-refinement-list__count': 'badge',
            'ais-refinement-list__item': 'checkbox'
            }">
            <h3 slot="header">Color</h3>
          </ais-refinement-list>

          <ais-rating attribute-name="rating" :classNames="{
            'ais-rating__count': 'badge'
            }">
            <h3 slot="header">Rating</h3>
          </ais-rating>

        </div>
        <div class="col-md-10 col-sm-9">
          <div class="search-controls form-inline">
            <ais-sort-by-selector :indices="[
                {name: 'ikea', label: 'Relevance'},
                {name: 'ikea_price_asc', label: 'Lowest price'},
                {name: 'ikea_price_desc', label: 'Highest price'}
                ]"
                :classNames="{'ais-sort-by-selector': 'form-control' }"
            />

            <ais-results-per-page-selector :options="[12, 24, 48]" :classNames="{'ais-results-per-page-selector': 'form-control' }"/>

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

          <ais-pagination class="pagination" :classNames="{
            'ais-pagination': 'pagination',
            'ais-pagination__item--active': 'active',
            'ais-pagination__item--disabled': 'disabled'

            }"/>

        </div>
      </div>
    </ais-index>

  </div>
</template>

<script>
export default {
  name: 'app',
};
</script>


<style lang="scss" rel="stylesheet/scss">
  #app {
    -webkit-font-smoothing: antialiased;
    padding-top: 20px;
  }

  .head-title {
    margin-top: 0;
  }

  .ais-powered-by {
    float: right;

    line-height: 26px;
    svg {
      vertical-align: bottom;
    }
  }

  .search-controls {
    padding-bottom: 20px;
  }

  .ais-stats {
    line-height: 36px;
  }

  .ais-results:after {
    content: " ";
    display: block;
    clear: both;
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

  .result__name mark, .result__type mark {
    font-style: normal;
    background: rgba(143, 187, 237, .1);
    box-shadow: inset 0 -1px 0 0 rgba(69, 142, 225, .8);
  }

  .result__type mark {
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
  .search-controls {
    .form-control {
      float: right;
      margin-left: 10px;
    }
  }
  .ais-sort-by-selector {
    float: right;
  }

  .ais-results-per-page-selector {
    float: right;
    margin-right: 10px;
  }

  /* Clear Search */
  .ais-clear--disabled {
    display: none;
  }

  /* Price Range */
  .ais-price-range__input--from, .ais-price-range__input--to {
    width: 65px;
    display: inline-block;
  }
</style>
