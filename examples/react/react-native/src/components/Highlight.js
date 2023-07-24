import React from 'react';
import { connectHighlight } from 'react-instantsearch-native';
import { Text } from 'react-native';

export default connectHighlight(
  ({ highlight, attribute, hit, highlightProperty }) => {
    const parsedHit = highlight({ attribute, hit, highlightProperty });
    const highligtedHit = parsedHit.map((part, idx) => {
      if (part.isHighlighted) {
        return (
          <Text key={idx} style={{ backgroundColor: '#ffff99' }}>
            {part.value}
          </Text>
        );
      }

      return part.value;
    });

    return <Text>{highligtedHit}</Text>;
  }
);
