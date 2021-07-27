import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
} from 'vue-router';
import qs from 'qs';

const routes = [
  { path: '/', component: () => import('./pages/Home.vue') },
  { path: '/about', component: () => import('./pages/About.vue') },
];

export function createRouter() {
  return _createRouter({
    history:
      process.env.SSR_TARGET === 'server'
        ? createMemoryHistory()
        : createWebHistory(),
    routes,
    parseQuery: qs.parse,
    stringifyQuery: qs.stringify,
  });
}
