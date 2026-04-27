import { ExternalLink } from "lucide-preact";

import { useFlavor, type Flavor } from "../context/flavor";

const BASE_URL = "https://www.algolia.com/doc/api-reference/widgets";

function docsUrl(name: string, flavor: Flavor): string {
  const kebab = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  return `${BASE_URL}/${kebab}/${flavor}/`;
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

export function DocsLinks({
  names,
  visible,
}: {
  names: string[];
  visible: boolean;
}) {
  return (
    <span
      class={`ml-auto flex gap-1 transition-opacity ${visible ? "opacity-100" : "opacity-0"}`}
      inert={!visible}
    >
      {names.map((name) => (
        <DocsLink key={name} name={name} />
      ))}
    </span>
  );
}
