import templates from './defaultShowMoreTemplates';
import { Templates } from '../../types';

const defaultShowMoreConfig = {
  templates,
  limit: 100,
};

type ShowMoreConfig = {
  templates: Templates;
  limit: number;
};

export default function getShowMoreConfig(
  showMoreOptions: boolean | ShowMoreConfig
): ShowMoreConfig | null {
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
