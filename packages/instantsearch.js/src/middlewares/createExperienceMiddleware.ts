import { getAppIdAndApiKey, walkIndex, warning } from '../lib/utils';

import type { InternalMiddleware } from '../types';
import type { ExperienceWidget } from '../widgets/experience/types';

export type ExperienceProps = {
  env?: 'prod' | 'beta';
};

const API_BASE = {
  beta: 'https://experiences-beta.algolia.com/1',
  prod: 'https://experiences.algolia.com/1',
};

export function createExperienceMiddleware(
  props: ExperienceProps = {}
): InternalMiddleware {
  const { env = 'prod' } = props;

  return ({ instantSearchInstance }) => {
    return {
      $$type: 'ais.experience',
      $$internal: true,
      onStateChange: () => {},
      subscribe() {
        const experienceWidgets: ExperienceWidget[] = [];

        // TODO: Recursion
        walkIndex(instantSearchInstance.mainIndex, (index) => {
          const widgets = index.getWidgets();

          widgets.forEach((widget) => {
            if (widget.$$type === 'ais.experience') {
              experienceWidgets.push(widget as ExperienceWidget);
            }
          });
        });

        const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);
        if (!(appId && apiKey)) {
          warning(
            false,
            'Could not retrieve credentials from the Algolia client.'
          );
          return;
        }

        Promise.all(
          experienceWidgets.map((widget) =>
            buildExperienceRequest({
              appId,
              apiKey,
              env,
              experienceId: widget.$$widgetParams.id,
            })
          )
        ).then((configs) => {
          configs.forEach((config, index) => {
            const widget = experienceWidgets[index];
            // TODO: Handle multiple config blocks for a single experience id
            const { type, parameters } = config.blocks[0];
            const { cssVariables, ...fetchedParams } = parameters;

            const cssVariablesKeys = Object.keys(cssVariables);
            if (cssVariablesKeys.length > 0) {
              injectStyleElement(`
                  :root {
                    ${cssVariablesKeys
                      .map((key) => {
                        return `--ais-${key}: ${cssVariables[key]};`;
                      })
                      .join(';')}
                  }
                `);
            }

            const widgetParent = widget.parent!;
            const newWidget = widget.$$supportedWidgets[type];
            widgetParent.removeWidgets([widget]);
            if (newWidget) {
              widgetParent.addWidgets([newWidget(fetchedParams)]);
            }
          });
        });
      },
      started: () => {},
      unsubscribe: () => {},
    };
  };
}

type BuildExperienceRequestParams = {
  appId: string;
  apiKey: string;
  env: NonNullable<ExperienceProps['env']>;
  experienceId: string;
};

function buildExperienceRequest({
  appId,
  apiKey,
  env,
  experienceId,
}: BuildExperienceRequestParams) {
  return fetch(`${API_BASE[env]}/experiences/${experienceId}`, {
    method: 'GET',
    headers: {
      'X-Algolia-Application-ID': appId,
      'X-Algolia-API-Key': apiKey,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }

      return res;
    })
    .then((res) => res.json());
}

export function injectStyleElement(textContent: string) {
  const style = document.createElement('style');

  style.textContent = textContent;

  document.head.appendChild(style);
}
