import { onPageSuggestions } from "instantsearch.js/es/widgets";
import { useEffect, useState } from "preact/hooks";

import { useWidget } from "../../hooks/useWidget";
import { useSearch } from "../../context/search";

// The generic `structured-outputs` endpoint only exists on the local backend
// for now (see the PoC handoff), so we point the widget at it through the Vite
// dev proxy (`/agent-backend` -> http://localhost:8000) to avoid CORS. Swap
// `transport` for `agentId` once the endpoint ships to the Algolia API.
const AGENT_ID = "deefd3da-ef9a-4cc6-969a-cc6fbb220bb7";
const APP_ID = "F4T6CUV2AH";
// Search-only key (safe to expose client-side, like the latency key in AgenticView).
const API_KEY = "f33fd36eb0c251c553e3cd7684a6ba33";

interface ProductHit {
  objectID: string;
  name: string;
  brand?: string;
  categories?: string[];
  price?: number;
  description?: string;
  image?: string;
}

const suggestionItem = (suggestion: unknown) =>
  typeof suggestion === "string"
    ? suggestion
    : (suggestion as { label?: string; title?: string })?.label ??
      (suggestion as { title?: string })?.title ??
      JSON.stringify(suggestion);

// The PDP "context" sent to the task: the meaningful record fields, without the
// search metadata (`_highlightResult`, `__position`, …) that the index returns.
function toContextProduct(hit: ProductHit) {
  return {
    objectID: hit.objectID,
    name: hit.name,
    brand: hit.brand,
    categories: hit.categories,
    price: hit.price,
    description: hit.description,
  };
}

// Mounts the widget for a single product. Re-mounted (via `key`) when the
// selected product changes, which re-runs the initial generation.
function ProductSuggestions({ product }: { product: ProductHit }) {
  const ref = useWidget((el) =>
    onPageSuggestions({
      container: el,
      contextType: "pdp",
      context: { product: toContextProduct(product) },
      maxSuggestions: 3,
      // Stream NDJSON snapshots so the list fills in progressively. The
      // connector reads the body as NDJSON when `stream` is true, so the
      // `?stream=true` query param must match.
      stream: true,
      transport: {
        api: `/agent-backend/1/agents/${AGENT_ID}/structured-outputs?stream=true`,
        headers: {
          "x-algolia-application-id": APP_ID,
          "x-algolia-api-key": API_KEY,
        },
      },
      templates: { item: suggestionItem },
      cssClasses: {
        root: "flex flex-col gap-2",
        refresh:
          "self-start rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800",
        list: "flex flex-col gap-1.5",
        item: "rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
        loading: "text-xs text-neutral-500 dark:text-neutral-400",
        empty: "text-xs text-neutral-500 dark:text-neutral-400",
      },
    })
  );

  return <div ref={ref} />;
}

export function WidgetOnPageSuggestions() {
  const search = useSearch();
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // `search.client` is typed as a search/composition union, so narrow it to
    // the plain multi-query `search` shape we use here.
    const client = search.client as unknown as {
      search: (
        requests: Array<{
          indexName: string;
          params: { query?: string; hitsPerPage?: number };
        }>
      ) => Promise<{ results: Array<{ hits?: ProductHit[] }> }>;
    };

    client
      .search([
        { indexName: search.indexName, params: { query: "", hitsPerPage: 6 } },
      ])
      .then((response) => {
        if (!active) return;
        const hits = response.results[0]?.hits ?? [];
        setProducts(hits);
        setSelectedId(hits[0]?.objectID ?? null);
      })
      .catch(() => {
        /* leave the loading state; nothing actionable for the demo */
      });
    return () => {
      active = false;
    };
  }, []);

  const selected =
    products.find((product) => product.objectID === selectedId) ?? null;

  if (!selected) {
    return (
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        Loading products from the index…
      </p>
    );
  }

  return (
    <div class="flex flex-col gap-3">
      {/* Record picker (records come from the index) */}
      <div class="flex flex-wrap gap-2">
        {products.map((product) => {
          const isSelected = product.objectID === selected.objectID;
          return (
            <button
              key={product.objectID}
              type="button"
              class={`max-w-[16rem] cursor-pointer truncate rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
              onClick={() => setSelectedId(product.objectID)}
            >
              {product.name}
            </button>
          );
        })}
      </div>

      {/* Selected record (the "PDP") */}
      <div class="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        {selected.image ? (
          <img
            src={selected.image}
            alt={selected.name}
            class="h-16 w-16 shrink-0 rounded-lg object-contain"
          />
        ) : (
          <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-2xl font-semibold text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500">
            {(selected.brand ?? selected.name).charAt(0)}
          </div>
        )}
        <div class="flex min-w-0 flex-col gap-1">
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {selected.name}
          </h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {[selected.brand, selected.price && `$${selected.price.toLocaleString()}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {selected.description && (
            <p class="line-clamp-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              {selected.description}
            </p>
          )}
        </div>
      </div>

      {/* Suggestions for the selected record */}
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          On-page suggestions
        </p>
        <ProductSuggestions key={selected.objectID} product={selected} />
      </div>
    </div>
  );
}
