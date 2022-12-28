/*
  By default, we maintain this repository based on Vue 2.
  That's why this file is exporting from `index-vue2`,
  which includes all the variables and methods for Vue 2.
  When `scripts/build-vue3.sh` runs, it will replace with
  > export * from './index-vue3';
  and revert it back after finished.
*/
export * from './index-vue2';
