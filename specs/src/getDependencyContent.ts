import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const cache = new Map();
async function getFilesFromDir(dir: string) {
  if (cache.has(dir)) {
    return cache.get(dir);
  }
  const output = (
    await readdir(dir, {
      withFileTypes: true,
      recursive: true,
    })
  )
    .filter((file) => file.isFile())
    .map((file) => join(file.path.replace('../packages/', ''), file.name));
  cache.set(dir, output);
  return output;
}

async function getFiles(flavor: 'react' | 'js' | 'vue') {
  const localDependencies = [
    'instantsearch.css',
    'instantsearch-ui-components',
    'instantsearch.js',
    flavor === 'react' && 'react-instantsearch',
    flavor === 'react' && 'react-instantsearch-core',
    flavor === 'vue' && 'vue-instantsearch',
  ].filter(Boolean);

  return {
    files: Object.fromEntries(
      await Promise.all(
        [
          'instantsearch.css/package.json',
          ...(await getFilesFromDir('../packages/instantsearch.css/themes')),
          'instantsearch-ui-components/package.json',
          ...(await getFilesFromDir(
            '../packages/instantsearch-ui-components/dist'
          )),
          'instantsearch.js/package.json',
          ...(await getFilesFromDir('../packages/instantsearch.js/es')),
          ...(flavor === 'react'
            ? await getFilesFromDir('../packages/instantsearch.js/cjs')
            : []),
          flavor === 'react' && 'react-instantsearch/package.json',
          ...(flavor === 'react'
            ? await getFilesFromDir('../packages/react-instantsearch/dist')
            : []),
          flavor === 'react' && 'react-instantsearch-core/package.json',
          ...(flavor === 'react'
            ? await getFilesFromDir('../packages/react-instantsearch-core/dist')
            : []),
          flavor === 'vue' && 'vue-instantsearch/package.json',
          ...(flavor === 'vue'
            ? await getFilesFromDir('../packages/vue-instantsearch/vue2/es')
            : []),
        ]
          .filter(Boolean)
          .map(async (file) => [
            `/node_modules/${file}`,
            {
              code: await readFile(`../packages/${file}`, 'utf-8'),
              hidden: true,
            },
          ])
      )
    ),
    dependencies: Object.assign(
      {},
      ...(await Promise.all(
        localDependencies.map(async (pkg) =>
          Object.fromEntries(
            Object.entries(
              JSON.parse(
                await readFile(`../packages/${pkg}/package.json`, 'utf-8')
              ).dependencies || {}
            ).filter(([key]) => !localDependencies.includes(key))
          )
        )
      ))
    ),
  };
}

export default async function getDependencyContent() {
  return {
    react: await getFiles('react'),
    js: await getFiles('js'),
    vue: await getFiles('vue'),
  };
}
