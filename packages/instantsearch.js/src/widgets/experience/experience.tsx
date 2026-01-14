import {
  createDocumentationMessageGenerator,
  getAppIdAndApiKey,
} from '../../lib/utils';
import { EXPERIMENTAL_autocomplete } from '../autocomplete/autocomplete';
import chat from '../chat/chat';

import { renderTemplate } from './render';
import { ExperienceWidget } from './types';

import type { ChatTransport } from '../../connectors/chat/connectChat';
import type { InstantSearch } from '../../types';
import type { TemplateChild } from './render';
import type { ExperienceWidgetParams } from './types';

import 'instantsearch.css/components/autocomplete.css';
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
      'ais.autocomplete': {
        widget: EXPERIMENTAL_autocomplete<any>,
        transformParams(params, { env, instantSearchInstance }) {
          const { agentId, ...rest } = params;
          return {
            agent: createAgentConfig(
              instantSearchInstance,
              env,
              agentId as string
            ),
            ...rest,
          };
        },
      },
      'ais.chat': {
        widget: chat,
        transformParams(params, { env, instantSearchInstance }) {
          const { itemTemplate, agentId, ...rest } = params;
          return {
            ...createAgentConfig(instantSearchInstance, env, agentId as string),
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

function createAgentConfig(
  instantSearchInstance: InstantSearch,
  env: 'beta' | 'prod',
  agentId: string
): ChatTransport {
  if (env === 'prod') {
    return { agentId };
  }

  const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

  return {
    transport: {
      api: `https://agent-studio-staging.eu.algolia.com/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': appId!,
        'x-algolia-api-key': apiKey!,
      },
    },
  };
}
