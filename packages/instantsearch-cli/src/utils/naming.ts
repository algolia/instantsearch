export function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

export function providerComponentName(experienceName: string): string {
  return `${toPascalCase(experienceName)}Provider`;
}

export function startFunctionName(experienceName: string): string {
  return `start${toPascalCase(experienceName)}`;
}

export function experienceComponentName(experienceName: string): string {
  return toPascalCase(experienceName);
}

export function widgetContainerId(widget: string): string {
  return widget
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}
