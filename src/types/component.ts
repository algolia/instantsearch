export type ComponentCSSClasses<TCSSClasses> = Required<
  { [className in keyof TCSSClasses]: string }
>;

export type ComponentTemplates<TTemplates> = Required<TTemplates>;
