import { ExternalLink } from 'lucide-preact';

import { useFlavor, type Flavor } from '../context/flavor';

const BASE_URL = 'https://www.algolia.com/doc/api-reference/widgets';

function toKebabCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * `param` deep-links to a single option on the widget's reference page. A few
 * pages anchor options differently, in which case the link just lands at the
 * top of the right page rather than scrolled to the option.
 */
function docsUrl(name: string, flavor: Flavor, param?: string): string {
  const hash = param ? `#param-${toKebabCase(param)}` : '';
  return `${BASE_URL}/${toKebabCase(name)}/${flavor}/${hash}`;
}

export function DocsLink({ name }: { name: string }) {
  const flavor = useFlavor();
  return (
    <a
      href={docsUrl(name, flavor)}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1 rounded bg-neutral-400 px-2 py-0.5 text-[10px] font-semibold uppercase text-white no-underline transition-colors hover:bg-neutral-500 dark:bg-neutral-600"
    >
      Docs
      <ExternalLink size={10} />
    </a>
  );
}

/** Compact, icon-only link to one option's documentation. */
export function ParamDocsLink({
  name,
  param,
}: {
  name: string;
  param: string;
}) {
  const flavor = useFlavor();
  const label = `${param} documentation`;
  return (
    <a
      href={docsUrl(name, flavor, param)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      class="shrink-0 rounded p-1 text-neutral-400 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
    >
      <ExternalLink size={11} />
    </a>
  );
}

export function DocsLinks({
  names,
  visible,
}: {
  names: string[];
  visible: boolean;
}) {
  return (
    <span
      class={`ml-auto flex gap-1 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
      inert={!visible}
    >
      {names.map((name) => (
        <DocsLink key={name} name={name} />
      ))}
    </span>
  );
}
