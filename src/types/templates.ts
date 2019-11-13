type StringTemplate = string;

type FunctionTemplate = (data: unknown) => string;

export type Templates = {
  [key: string]: StringTemplate | FunctionTemplate;
};
