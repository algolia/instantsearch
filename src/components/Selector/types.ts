export type SelectorProps = {
  cssClasses?: {
    root?: string | string[];
    select?: string | string[];
    option?: string | string[];
  };
  currentValue?: string | number;
  options: Array<{
    value?: string | number;
    label: string;
  }>;
  setValue(value: string): void;
};
