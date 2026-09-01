import { openChat } from 'instantsearch.js/es/lib/chat';
import React, { useEffect, useState } from 'react';
import { useInstantSearch } from 'react-instantsearch';

import type { ChatRenderState } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { Hit } from 'instantsearch.js';

type Props = {
  hit: Hit;
  agentId: string;
  appId: string;
  apiKey: string;
};

const FALLBACK = [
  'Tell me more about this product',
  "What's it good for?",
  'Are there similar options?',
];

export function PromptSuggestions({ hit, agentId, appId, apiKey }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { indexRenderState } = useInstantSearch();
  const chatRenderState = indexRenderState.chat as
    | Partial<ChatRenderState>
    | undefined;

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);
    setSuggestions([]);

    const endpoint = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5&stream=false`;
    const body = JSON.stringify({
      messages: [
        {
          id: `ps-${Date.now()}`,
          createdAt: new Date().toISOString(),
          role: 'user',
          parts: [{ type: 'text', text: JSON.stringify(hit) }],
        },
      ],
    });

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-application-id': appId,
        'x-algolia-api-key': apiKey,
        'x-algolia-agent': 'prompt-suggestions-poc (1.0.0)',
      },
      body,
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const text = data?.parts?.[1]?.text;
        const parsed = typeof text === 'string' ? JSON.parse(text) : null;
        const list: string[] = (Array.isArray(parsed) ? parsed : FALLBACK)
          .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
          .slice(0, 3);
        setSuggestions(list.length > 0 ? list : FALLBACK);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setHasError(true);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [hit.objectID, agentId, appId, apiKey]);

  if (hasError) {
    return null;
  }

  return (
    <div className="prompt-suggestions">
      <div className="prompt-suggestions-header">
        <span className="prompt-suggestions-sparkle" aria-hidden>
          ✨
        </span>
        <span>Ask AI about this product</span>
      </div>
      {isLoading ? (
        <ul className="prompt-suggestions-list">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="prompt-suggestions-skeleton"
              style={{ width: `${110 + i * 30}px` }}
            />
          ))}
        </ul>
      ) : (
        <ul className="prompt-suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                className="prompt-suggestions-chip"
                onClick={() =>
                  openChat(chatRenderState, {
                    message: suggestion,
                    referer: 'prompt-suggestions',
                  })
                }
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
