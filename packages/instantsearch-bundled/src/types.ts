import type { widgets } from './widgets';

export type Child = {
  [key in keyof typeof widgets]: {
    type: key;
    parameters: Omit<Parameters<typeof widgets[key]>[0], 'container'>;
  };
}[keyof typeof widgets];

export type Configuration = {
  id: string;
  indexName: string;
  children: Child[];
};
