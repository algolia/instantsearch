import templates from './defaultShowMoreTemplates';

const defaultShowMoreConfig = {
  templates,
  limit: 100,
};

export default function getShowMoreConfig(showMoreOptions) {
  if (!showMoreOptions) return null;

  if (showMoreOptions === true) {
    return defaultShowMoreConfig;
  }

  const config = { ...showMoreOptions };
  if (!showMoreOptions.templates) {
    config.templates = defaultShowMoreConfig.templates;
  }
  if (!showMoreOptions.limit) {
    config.limit = defaultShowMoreConfig.limit;
  }
  return config;
}
