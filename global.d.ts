declare const __DEV__: boolean;

declare namespace NodeJS {
  // override the type set by Next (in examples), which sets NODE_ENV to readonly globally
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

declare module 'react-instantsearch-core-v6' {
  export const InstantSearch: any;
}

declare module 'jest-serializer-html/createSerializer' {
  export default function createSerializer(): jest.SnapshotSerializerPlugin;
}
