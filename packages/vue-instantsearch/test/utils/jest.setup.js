import createSerializer from 'jest-serializer-html/createSerializer';
import Vue from 'vue';

Vue.config.productionTip = false;

expect.addSnapshotSerializer(
  createSerializer({
    print: {
      sortAttributes: names => names.sort(),
    },
  })
);
