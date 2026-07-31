import React from 'react';
import {
  useToggleRefinement,
  UseToggleRefinementProps,
} from 'react-instantsearch-core';
import { StyleSheet, Switch, Text, View } from 'react-native';

type ToggleRefinementProps = UseToggleRefinementProps & {
  label: string;
  onChange?: () => void;
};

export function ToggleRefinement({
  label,
  onChange,
  ...props
}: ToggleRefinementProps) {
  const { value, refine } = useToggleRefinement(props);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        trackColor={{ true: '#252b33', false: '#ccc' }}
        value={value.isRefined}
        onValueChange={(isChecked) => {
          refine({ isRefined: !isChecked });
          onChange?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    flexShrink: 1,
    marginRight: 12,
  },
});
