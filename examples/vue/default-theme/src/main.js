import Vue from 'vue';
import InstantSearch from 'vue-instantsearch/vue2/es';

import './App.css';
import App from './App.vue';

Vue.use(InstantSearch);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
