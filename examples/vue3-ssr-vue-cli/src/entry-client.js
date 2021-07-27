import { createApp } from './app';

const { app, router } = createApp();

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  app.mount('#app');
});
