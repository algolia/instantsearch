import templates from './defaultShowMoreTemplates.js';

const defaultShowMoreConfig = {
  templates,
  limit: 100
};

export default function getShowMoreConfig(showMoreOptions) {
  if (!showMoreOptions) return null;

  if (showMoreOptions === true) {
    return defaultShowMoreConfig;
  }

  let config = {...showMoreOptions};
  if (!showMoreOptions.templates) {
    config.templates = defaultShowMoreConfig.templates;
  }
  if (!showMoreOptions.limit) {
    config.limit = defaultShowMoreConfig.limit;
  }
  return config;
}
