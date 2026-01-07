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
            const { type, parameters } =
              config.blocks[1].children[0].children[0];
            const { cssVars, ...fetchedParams } = parameters;

            const cssVarsKeys = Object.keys(cssVars);
            if (cssVarsKeys.length > 0) {
              injectStyleElement(`
                  :root {
                    ${cssVarsKeys
                      .map((key) => {
                        const { r, g, b } = hexToRgb(cssVars[key]);

                        return `${key}: ${r}, ${g}, ${b}`;
                      })
                      .join(';')}
                  }
                `);
            }

            const widgetParent = widget.parent!;
            const newWidget = widget.$$supportedWidgets[type];
            widgetParent.removeWidgets([widget]);
            if (newWidget) {
              widgetParent.addWidgets([
                newWidget({
                  ...fetchedParams,
                  container: '#chat', // TODO: Get from API
                }),
              ]);
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

export function hexToRgb(hex: string) {
  const cleanHex = hex.replace(/^#/, '');

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

export function injectStyleElement(textContent: string) {
  const style = document.createElement('style');

  style.textContent = textContent;

  document.head.appendChild(style);
}
