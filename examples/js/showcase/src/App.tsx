import { Blocks, MapPin, Search, Sparkles, Wand2 } from 'lucide-preact';
import { useState } from 'preact/hooks';

import { ColorModeSwitcher } from './components/ColorModeSwitcher';
import { FlavorContext } from './context/flavor';
import { ViewContext } from './context/view';
import { getFlavorFromURL, getIndexFromURL, setParams } from './utils/url';
import { AgenticView } from './views/AgenticView';
import { GeoSearchView } from './views/GeoSearchView';
import { InstantSearchView } from './views/InstantSearchView';
import { RecommendView } from './views/RecommendView';
import { ReferenceView } from './views/ReferenceView';

import type { LucideIcon } from 'lucide-preact';
import type { ComponentType } from 'preact';

interface Experience {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  view: ComponentType;
}

const experiences: Experience[] = [
  {
    slug: 'instantsearch',
    title: 'InstantSearch',
    description: 'Full search interface',
    icon: Search,
    view: InstantSearchView,
  },
  {
    slug: 'agentic',
    title: 'Agentic',
    description: 'AI-powered search and chat',
    icon: Sparkles,
    view: AgenticView,
  },
  {
    slug: 'geosearch',
    title: 'GeoSearch',
    description: 'Search through locations',
    icon: MapPin,
    view: GeoSearchView,
  },
  {
    slug: 'recommend',
    title: 'Recommend',
    description: 'Personalized recommendations',
    icon: Wand2,
    view: RecommendView,
  },
  {
    slug: 'reference',
    title: 'Reference',
    description: 'Options for all widgets',
    icon: Blocks,
    view: ReferenceView,
  },
];

const viewSlugs = experiences.map((experience) => experience.slug);

export function App() {
  const [currentIndex, setCurrentIndex] = useState(() =>
    getIndexFromURL('view', viewSlugs)
  );
  const flavor = getFlavorFromURL();

  return (
    <FlavorContext.Provider value={flavor}>
      <div class="p-4">
        <div class="@container mb-6 flex flex-wrap items-start justify-between gap-3">
          <div class="grid min-w-0 flex-1 grid-cols-1 gap-3 @xl:flex-none @xl:auto-cols-fr @xl:grid-cols-none @xl:grid-flow-col">
            {experiences.map((experience, index) => (
              <button
                key={index}
                type="button"
                class={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-5 py-4 text-center transition-all ${
                  currentIndex === index
                    ? 'border-neutral-200 bg-white shadow-xs dark:border-neutral-700 dark:bg-neutral-800'
                    : 'border-transparent bg-neutral-50 hover:border-neutral-200 hover:bg-white hover:shadow-xs dark:bg-neutral-800/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-800'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setParams({ view: experience.slug });
                }}
              >
                <experience.icon
                  size={20}
                  class={`transition-[color] ${
                    currentIndex === index
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400'
                  }`}
                />
                <div class="flex flex-col gap-0.5">
                  <span
                    class={`text-sm font-semibold transition-colors ${
                      currentIndex === index
                        ? 'text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200'
                    }`}
                  >
                    {experience.title}
                  </span>
                  <span
                    class={`text-xs transition-colors ${
                      currentIndex === index
                        ? 'text-neutral-500 dark:text-neutral-400'
                        : 'text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400'
                    }`}
                  >
                    {experience.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <ColorModeSwitcher />
        </div>

        {experiences.map((experience, index) =>
          currentIndex === index ? (
            <ViewContext.Provider key={index} value={experience.slug}>
              <experience.view />
            </ViewContext.Provider>
          ) : null
        )}
      </div>
    </FlavorContext.Provider>
  );
}
