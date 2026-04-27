import type { RootManifest } from '../manifest';
import type { Flavor } from '../types';
import { providerComponentName, startFunctionName, experienceComponentName, widgetContainerId } from './naming';

export type NextSteps = {
  imports: string[];
  mountingGuidance: string;
};

export function experienceImportBase(
  manifest: Pick<RootManifest, 'componentsPath' | 'aliases'>,
  experienceName: string
): string {
  const alias = manifest.aliases.components;
  return alias
    ? `${alias}/${experienceName}`
    : `${manifest.componentsPath}/${experienceName}`;
}

function widgetImportLine(params: {
  importBase: string;
  exportName: string;
  fileName: string;
}): string {
  const { importBase, exportName, fileName } = params;
  const binding =
    exportName === fileName ? exportName : `${exportName} as ${fileName}`;
  return `import { ${binding} } from '${importBase}/${fileName}';`;
}

function providerImportLine(
  flavor: Flavor,
  experienceName: string,
  importBase: string
): string {
  const binding =
    flavor === 'js'
      ? startFunctionName(experienceName)
      : providerComponentName(experienceName);
  return `import { ${binding} } from '${importBase}/provider';`;
}

export function buildExperienceNextSteps(params: {
  flavor: Flavor;
  experienceName: string;
  importBase: string;
  widgets: string[];
}): NextSteps {
  const { flavor, experienceName, importBase, widgets } = params;

  if (flavor === 'js') {
    const containers = widgets
      .map((w) => `<div id="${widgetContainerId(w)}"></div>`)
      .join(', ');
    return {
      imports: [`import '${importBase}';`],
      mountingGuidance: `Add the following container elements to your HTML: ${containers}`,
    };
  }

  const componentName = experienceComponentName(experienceName);
  return {
    imports: [`import { ${componentName} } from '${importBase}';`],
    mountingGuidance: `Render <${componentName} /> wherever the search should appear.`,
  };
}

export function buildWidgetNextSteps(params: {
  flavor: Flavor;
  experienceName: string;
  importBase: string;
  widget: string;
  fileName: string;
  includeProvider: boolean;
}): NextSteps {
  const { flavor, experienceName, importBase, widget, fileName, includeProvider } =
    params;
  const widgetImport = widgetImportLine({
    importBase,
    exportName: widget,
    fileName,
  });
  const imports = includeProvider
    ? [providerImportLine(flavor, experienceName, importBase), widgetImport]
    : [widgetImport];

  if (flavor === 'js') {
    const startName = startFunctionName(experienceName);
    return {
      imports,
      mountingGuidance: `Pass ${fileName}('#container') into ${startName}([...]) to mount it.`,
    };
  }

  const providerName = providerComponentName(experienceName);
  return {
    imports,
    mountingGuidance: `Render <${fileName} /> inside <${providerName}> wherever the search should appear.`,
  };
}
