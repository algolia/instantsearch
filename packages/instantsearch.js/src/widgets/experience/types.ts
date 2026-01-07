import type { Widget } from '../../types';

export type ExperienceWidgetParams = {
  id: string;
};

export type ExperienceWidget = Widget & {
  $$widgetParams: ExperienceWidgetParams;
  $$supportedWidgets: Record<string, (...args: any[]) => Widget>;
};
