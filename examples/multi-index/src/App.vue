<template>
  <div id="app">

    <h2>Multi-Index Search Example</h2>

    <p>In this example, we have one single search input that will fetch results from 2 different indices when the query is changed.</p>

    <input v-model="query" class="ais-input" placeholder="Search for a product...">
    <ais-powered-by />

    <div class="grid">
      <ais-index appId="latency" apiKey="6be0576ff61c053d5f9a3225e2a90f76" indexName="bestbuy" :query="query">
        <ais-results>
          <div slot="header">
            <h2>Products from first index</h2>
            <ais-stats></ais-stats>
          </div>

          <template scope="{ result }">
            <div class="search-result">
              <img class="result__image img-responsive" :src="result.thumbnailImage">

              <div class="result__info">
                <h2 class="result__name">
                  <ais-highlight :result="result" attribute-name="name"/>
                </h2>
                <div class="result__type">
                  {{ result.category }}
                </div>

                <div class="result__description" >
                  <ais-highlight v-if="result._highlightResult.shortDescription" :result="result" attribute-name="shortDescription"/>
                </div>

                <div class="result__rating">

                  <span class="result__star"></span><span class="result__star"></span><span class="result__star"></span><span class="result__star"></span><span class="result__star"></span> ({{ result.customerReviewCount }})

                </div>
                <div class="result__price">${{result.salePrice}}</div>
              </div>
            </div>
          </template>
        </ais-results>
      </ais-index>

      <ais-index appId="latency" apiKey="6be0576ff61c053d5f9a3225e2a90f76" indexName="ikea" :query="query">
        <ais-results>

          <div slot="header">
            <h2>Products from second index</h2>
            <ais-stats></ais-stats>
          </div>

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
                <div class="result__description">
                  <ais-highlight :result="result" attribute-name="description"/>
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
      </ais-index>
    </div>

    <p style="text-align: center;">Data courtesy of ikea.com &amp; bestbuy.com</p>
  </div>


</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      query: '',
    };
  },
};
</script>

<style lang="scss" rel="stylesheet/scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
  }

  h2 {
    margin-bottom: 5px;
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
  }

  .ais-powered-by {
    text-align: right;
  }

  .ais-stats {
    margin-bottom: 10px;
  }

  .grid {
    display: flex;

    .ais-index {
      flex: 0 0 50%;
    }
  }

  .search-result {
    padding: 10px 20px 20px;

    margin-bottom: 10px;
    border: solid 1px #EEE;
    box-shadow: 0 0 3px #f6f6f6;
    margin-right: 1%;
    position: relative;
    border-radius: 3px;
    min-width: 220px;
    background: #FFF;
    transition: all .5s;

    &:after {
      content: " ";
      clear: both;
      display: block;
    }
  }

  .result__info {
    padding: 0px 20px 20px;
    overflow: hidden;
  }

  .result__image {
    float: left;
    max-height: 75px;

  }

  .result__name {
    font-size: 14px;
    font-weight: bold;
  }

  .result__name em, .result__type em, .result__description em {
    font-style: normal;
    background: rgba(143, 187, 237, .1);
    box-shadow: inset 0 -1px 0 0 rgba(69, 142, 225, .8);
  }

  .result__type em, .result__description em {
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
    margin-bottom: 10px;
  }

  .result__description {
    font-size: 13px;
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


</style>
