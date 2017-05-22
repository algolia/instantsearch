import Vue from 'vue';
import VueRouter from 'vue-router';
import InstantSearch from 'vue-instantsearch';
import App from './App.vue';
import Search from './Search.vue';

Vue.use(InstantSearch);
Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      name: 'search',
      path: '/search',
      component: Search,
      props: route => ({ query: route.query.q }),
    },
    { path: '/', redirect: '/search' },
  ],
});

new Vue({
  el: '#app',
  render: h => h(App),
  router,
});
