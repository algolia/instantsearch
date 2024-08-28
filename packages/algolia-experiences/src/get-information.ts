export type Settings = {
  appId: string;
  apiKey: string;
};

export function getSettings(): Settings {
  const metaConfiguration = document.querySelector<HTMLMetaElement>(
    'meta[name="algolia-configuration"]'
  );

  if (!metaConfiguration || !metaConfiguration.content) {
    throw new Error('No meta tag found');
  }

  const { appId, apiKey } = JSON.parse(metaConfiguration.content);

  if (!appId || !apiKey) {
    throw new Error('Missing appId or apiKey in the meta tag');
  }

  return { appId, apiKey };
}

export function getElements() {
  const elements = new Map<string, HTMLElement>();
  document
    .querySelectorAll<HTMLElement>('[data-experience-id]')
    .forEach((element) => {
      const id = element.dataset.experienceId!;
      elements.set(id, element);
    });

  return elements;
}
