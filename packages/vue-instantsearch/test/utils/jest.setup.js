import createSerializer from 'jest-serializer-html/createSerializer';
import { isVue2, Vue2 } from './src/util/vue';

if (isVue2) {
  Vue2.config.productionTip = false;
}

expect.addSnapshotSerializer(
  createSerializer({
    print: {
      sortAttributes: names => names.sort(),
    },
  })
);
