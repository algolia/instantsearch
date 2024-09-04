export type WidgetFrontmatter = {
  title: string;
  html?: string;
  alt1?: string;
  althtml1?: string;
  alt2?: string;
  althtml2?: string;
  info?: string;
  classes?: Array<{ name: string; description: string }>;
  options?: Array<{ name: string; description: string; default?: string }>;
  translations?: Array<{ name: string; description: string; default?: string }>;
  examples?: Array<{
    library: 'instantsearch.js' | 'react-instantsearch' | 'vue';
    flavor: 'js' | 'react' | 'vue';
    code: string;
  }>;
};
