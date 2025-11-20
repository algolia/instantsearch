import React, { useEffect, useState } from 'react';
import { useChat, useHits } from 'react-instantsearch-core';

type PromptSuggestionsUiProps = {
  agentId: string;
};

export function PromptSuggestions({ agentId }: PromptSuggestionsUiProps) {
  const { items } = useHits();
  const [suggestions, setSuggestions] = useState<Array<{ title: string }>>([]);

  const { messages, status, sendMessage } = useChat({ agentId });

  useEffect(() => {
    if (items.length > 0) {
      sendMessage({
        text: JSON.stringify(items[0]),
      });
    }
  }, [items, sendMessage]);

  useEffect(() => {
    if (status === 'ready') {
      // get last assistant message
      const lastMessage = messages.find(
        (message) => message.role === 'assistant'
      );

      try {
        if (lastMessage) {
          const payload = lastMessage.parts.find(
            (part) => part.type === 'text'
          );
          const parsed = JSON.parse(payload?.text || '');
          if (Array.isArray(parsed.suggestions)) {
            setSuggestions(parsed.suggestions);
          }
        }
      } catch (e) {
        console.error('Failed to parse suggestions from assistant message', e);
      }
    }
  }, [messages, status]);

  return (
    <div>
      <span>Item: {JSON.stringify(items[0])}</span>
      <span>Messages: {JSON.stringify(messages)}</span>

      <button
        onClick={() => {
          if (items.length > 0) {
            sendMessage({
              text: JSON.stringify(items[0]),
            });
          }
        }}
      >
        Send Message
      </button>

      {suggestions.length > 0 && (
        <div>
          <h3>Suggestions:</h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
