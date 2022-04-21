declare const __DEV__: boolean;

declare namespace NodeJS {
  // override the type set by Next (in examples), which sets NODE_ENV to readonly globally
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
