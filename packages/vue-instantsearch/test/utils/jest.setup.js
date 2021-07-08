import { isVue2, Vue2 } from './src/util/vue';

if (isVue2) {
  Vue2.config.productionTip = false;
}
