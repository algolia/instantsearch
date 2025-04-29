import Vue from 'vue';
import InstantSearch from 'vue-instantsearch';

import './Theme.css';
import './App.css';
import './App.mobile.css';
import './widgets/PriceSlider.css';
import App from './App.vue';

Vue.use(InstantSearch);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
