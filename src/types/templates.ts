import type { BindEventForHits } from '../lib/utils/index.js';

export type Template<TTemplateData = void> =
  | string
  | ((data: TTemplateData) => string);

export type TemplateWithBindEvent<TTemplateData = void> =
  | string
  | ((data: TTemplateData, bindEvent: BindEventForHits) => string);

export type Templates = {
  [key: string]: Template<any> | TemplateWithBindEvent<any> | undefined;
};

export type HoganHelpers<TKeys extends string = string> = Record<
  TKeys,
  (text: string, render: (value: string) => string) => string
>;
