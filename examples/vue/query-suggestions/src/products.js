import Vue from 'vue';
import InstantSearch from 'vue-instantsearch';

import Product from './Product.vue';

Vue.config.productionTip = false;

Vue.use(InstantSearch);

const pid = new URLSearchParams(document.location.search).get('pid');

new Vue({
  render: (h) => h(Product, { props: { pid } }),
}).$mount('#app');
