import { isVue3, Vue2 } from 'vue-demi';
import { version } from 'vue';

export function getVueVersion() {
  if (isVue3) {
    return version;
  } else {
    return Vue2.version;
  }
}
