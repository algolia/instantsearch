import { isVue3, version, Vue2 } from 'vue-demi';

export function getVueVersion() {
  if (isVue3) {
    return version;
  } else {
    return Vue2.version;
  }
}
