/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */

// Ensure that the JSX namespace is available in this file and its dependents.
declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {}
  }
}

// For safety when there's no @types/react or preact, we don't directly use
// JSX.IntrinsicElements
type IntrinsicElements = keyof JSX.IntrinsicElements extends never
  ? Record<string, unknown>
  : JSX.IntrinsicElements;

export type Pragma = (
  type: any,
  props: Record<string, any> | null,
  ...children: ComponentChildren[]
) => JSX.Element;

export type PragmaFrag = any;

type ComponentChild =
  | VNode<any>
  | object
  | string
  | number
  | boolean
  | null
  | undefined;

export type ComponentChildren = ComponentChild[] | ComponentChild;

type PropsWithChildren<TProps> = TProps & { children?: ComponentChildren };

type FunctionComponent<TProps = Record<string, any>> = (
  props: PropsWithChildren<TProps>,
  context?: any
) => JSX.Element;

export type ElementType<TProps = any> =
  | {
      [TKey in keyof IntrinsicElements]: TProps extends IntrinsicElements[TKey]
        ? TKey
        : never;
    }[keyof IntrinsicElements]
  | FunctionComponent<TProps>;

export type ComponentProps<TComponent extends keyof IntrinsicElements> =
  IntrinsicElements[TComponent];

export type VNode<TProps = any> = {
  type: any;
  props: TProps & {
    children: ComponentChildren;
    key?: string | number | null;
  };
};

export type Renderer = {
  /**
   * The function to create virtual nodes.
   *
   * @default preact.createElement
   */
  createElement: Pragma;
  /**
   * The component to use to create fragments.
   *
   * @default preact.Fragment
   */
  Fragment: PragmaFrag;
};
