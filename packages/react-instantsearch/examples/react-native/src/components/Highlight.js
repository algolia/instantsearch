import React from 'react';
import { Text } from 'react-native';
import { connectHighlight } from 'react-instantsearch/connectors';

export default connectHighlight(
  ({ highlight, attribute, hit, highlightProperty }) => {
    const parsedHit = highlight({ attribute, hit, highlightProperty });
    const highligtedHit = parsedHit.map((part, idx) => {
      if (part.isHighlighted)
        return (
          <Text key={idx} style={{ backgroundColor: '#ffff99' }}>
            {part.value}
          </Text>
        );
      return part.value;
    });
    return <Text>{highligtedHit}</Text>;
  }
);
