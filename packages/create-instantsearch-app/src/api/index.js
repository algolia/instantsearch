import path from 'path';

import buildTask from '../tasks/common/build.cjs';
import cleanTask from '../tasks/common/clean.cjs';
import { getAllTemplates } from '../utils/index.js';

import checkConfig from './check-config.js';
import resolveTemplate from './resolve-template.js';

const supportedTemplates = getAllTemplates();

function noop() {}

function createInstantSearchApp(appPath, options = {}, tasks = {}) {
  const config = {
    ...options,
    template: resolveTemplate(options, { supportedTemplates }),
    name: options.name || path.basename(appPath || ''),
    installation: options.installation !== false,
    silent: options.silent === true,
    path: appPath ? path.resolve(appPath) : '',
  };

  checkConfig(config, { supportedTemplates });

  const {
    setup = noop,
    build = buildTask,
    install = noop,
    clean = cleanTask,
    teardown = noop,
  } = tasks;

  async function create() {
    try {
      await setup(config);
    } catch (err) {
      return;
    }

    try {
      await build(config);

      if (config.installation) {
        try {
          await install(config);
        } catch (err) {
          await clean(config);
          return;
        }
      }
    } catch (err) {
      return;
    }

    await teardown(config);
  }

  return {
    create,
  };
}

export default createInstantSearchApp;
