import React, { useEffect, useRef, useState } from 'react';

import { PRESET } from '../backend';

import type { AgenticSearch, SearchMode } from '../agent/useAgenticSearch';

const MODES: Array<{ value: SearchMode; label: string; hint: string }> = [
  {
    value: 'auto',
    label: 'Auto',
    hint: 'AI for questions, search for keywords',
  },
  { value: 'search', label: 'Search', hint: 'Always regular search' },
  { value: 'agent', label: 'Ask AI', hint: 'Always ask the agent' },
];

const PLACEHOLDERS: Record<SearchMode, string> = {
  auto: 'Search, or just describe what you need',
  search: 'Search products',
  agent: 'Ask the AI for anything',
};

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}) {
  return (
    <fieldset className="mode-switch">
      <legend className="sr-only">Search mode</legend>
      {MODES.map((option) => (
        <label
          key={option.value}
          className={`mode-option${mode === option.value ? ' is-active' : ''}`}
          title={option.hint}
        >
          <input
            type="radio"
            name="search-mode"
            value={option.value}
            checked={mode === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.value === 'agent' ? <span aria-hidden="true">✦ </span> : null}
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export function SearchBar({ agent }: { agent: AgenticSearch }) {
  const { isAgentic, query, submit, reset, mode, setMode } = agent;
  const [value, setValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // Regular search shows the current query. A follow-up empties the input,
  // since each one is a new turn rather than an edit of the query.
  useEffect(() => {
    setValue(isAgentic ? '' : query);
  }, [isAgentic, query]);

  const send = (text: string) => {
    submit(text);
    if (isAgentic) setValue('');
  };

  // Clearing ends the conversation and the query: whatever is typed next is
  // a new search (which may start a new conversation).
  const clear = () => {
    reset();
    setValue('');
    inputRef.current?.focus();
  };
  const canClear = value !== '' || query !== '' || isAgentic;

  const suggestions = isAgentic ? PRESET.followUps : PRESET.suggestions;

  return (
    <div className="searchbar">
      <div className="searchbar-top">
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>
      <form
        role="search"
        className={`searchbar-form${isAgentic ? ' is-agentic' : ''}`}
        onSubmit={(event) => {
          event.preventDefault();
          send(value);
        }}
      >
        <span className="searchbar-icon" aria-hidden="true">
          {isAgentic ? '✦' : '⌕'}
        </span>
        <label htmlFor="search-input" className="sr-only">
          {isAgentic ? 'Ask a follow-up' : 'Search products'}
        </label>
        <input
          id="search-input"
          ref={inputRef}
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={
            isAgentic
              ? `Ask a follow-up: “${PRESET.followUps[0]}”…`
              : PLACEHOLDERS[mode]
          }
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return;
            // First Escape drops the typed text, the next one clears all.
            event.preventDefault();
            if (value !== '') setValue('');
            else if (canClear) clear();
          }}
        />
        {canClear ? (
          <button
            type="button"
            className="searchbar-clear"
            onClick={clear}
            aria-label={
              isAgentic ? 'Clear and start a new search' : 'Clear the search'
            }
            title={isAgentic ? 'Clear and start a new search' : 'Clear'}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        <button type="submit" className="searchbar-submit">
          {isAgentic || mode === 'agent' ? 'Ask' : 'Search'}
        </button>
      </form>
      <div className="suggestions" aria-label="Try">
        <span className="suggestions-label">
          {isAgentic ? 'Follow up' : 'Try'}
        </span>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="chip"
            onClick={() => {
              send(suggestion);
              inputRef.current?.focus();
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
