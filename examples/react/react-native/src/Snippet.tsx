import { Hit as AlgoliaHit } from 'instantsearch.js';
import {
  getHighlightedParts,
  getPropertyByPath,
} from 'instantsearch.js/es/lib/utils';
import React, { Fragment } from 'react';
import { StyleSheet, Text } from 'react-native';

type SnippetPartProps = {
  children: React.ReactNode;
  isHighlighted: boolean;
};

function SnippetPart({ children, isHighlighted }: SnippetPartProps) {
  return (
    <Text style={isHighlighted ? styles.highlighted : styles.nonHighlighted}>
      {children}
    </Text>
  );
}

type SnippetProps<THit> = {
  hit: THit;
  attribute: keyof THit | string[];
  separator?: string;
};

// Renders the `_snippetResult` of an attribute, mirroring the web `<Snippet>`
// widget but with React Native `Text` nodes instead of DOM elements.
export function Snippet<THit extends AlgoliaHit>({
  hit,
  attribute,
  separator = ', ',
}: SnippetProps<THit>) {
  const { value: attributeValue = '' } =
    getPropertyByPath(hit._snippetResult, attribute as string) || {};
  const parts = getHighlightedParts(attributeValue);

  return (
    <>
      {parts.map((part, partIndex) => {
        if (Array.isArray(part)) {
          const isLastPart = partIndex === parts.length - 1;

          return (
            <Fragment key={partIndex}>
              {part.map((subPart, subPartIndex) => (
                <SnippetPart
                  key={subPartIndex}
                  isHighlighted={subPart.isHighlighted}
                >
                  {subPart.value}
                </SnippetPart>
              ))}

              {!isLastPart && separator}
            </Fragment>
          );
        }

        return (
          <SnippetPart key={partIndex} isHighlighted={part.isHighlighted}>
            {part.value}
          </SnippetPart>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  highlighted: {
    fontWeight: 'bold',
    color: '#6f6106',
  },
  nonHighlighted: {
    color: '#666',
  },
});
