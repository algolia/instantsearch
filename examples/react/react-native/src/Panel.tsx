import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type PanelProps = {
  header: string;
  children: React.ReactNode;
};

export function Panel({ header, children }: PanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{header}</Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  header: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#888',
    marginBottom: 12,
  },
});
