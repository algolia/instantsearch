import {
  createDocumentationMessageGenerator,
  getAppIdAndApiKey,
} from '../../lib/utils';
import chat from '../chat/chat';

import { renderTemplate } from './render';
import { ExperienceWidget } from './types';

import type { TemplateChild } from './render';
import type { ExperienceWidgetParams } from './types';

import 'instantsearch.css/components/chat.css';

const withUsage = createDocumentationMessageGenerator({ name: 'experience' });

export default (function experience(widgetParams: ExperienceWidgetParams) {
  const { id } = widgetParams || {};

  if (!id) {
    throw new Error(withUsage('The `id` option is required.'));
  }

  return {
    $$type: 'ais.experience',
    $$widgetType: 'ais.experience',
    $$widgetParams: widgetParams,
    $$supportedWidgets: {
      'ais.chat': {
        widget: chat,
        transformParams(params, { env, instantSearchInstance }) {
          const { itemTemplate, agentId, ...rest } = params;
          const [appId, apiKey] = getAppIdAndApiKey(
            instantSearchInstance.client
          );
          return {
            ...(env === 'prod'
              ? { agentId: agentId as string }
              : {
                  transport: {
                    api: `https://agent-studio-staging.eu.algolia.com/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
                    headers: {
                      'x-algolia-application-id': appId!,
                      'x-algolia-api-key': apiKey!,
                    },
                  },
                }),
            ...rest,
            templates: {
              ...(rest.templates as Record<string, unknown>),
              ...(itemTemplate
                ? { item: renderTemplate(itemTemplate as TemplateChild[]) }
                : {}),
            },
          };
        },
      },
    },
    render: () => {},
    dispose: () => {},
  } satisfies ExperienceWidget;
});
