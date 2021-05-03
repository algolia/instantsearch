import { BindEventForHits } from '../lib/utils';

export type Template<TTemplateData = void> =
  | string
  | ((data: TTemplateData) => string);

export type TemplateWithBindEvent<TTemplateData = void> =
  | string
  | ((data: TTemplateData, bindEvent: BindEventForHits) => string);

export type Templates = {
  [key: string]: Template<any> | TemplateWithBindEvent<any> | undefined;
};
