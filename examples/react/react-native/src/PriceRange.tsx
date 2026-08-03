import React, { useEffect, useState } from 'react';
import { useRange, UseRangeProps } from 'react-instantsearch-core';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type PriceRangeProps = UseRangeProps & {
  onChange?: () => void;
};

function toInputValue(value: number | undefined): string {
  if (value === undefined || value === -Infinity || value === Infinity) {
    return '';
  }
  return String(value);
}

export function PriceRange({ onChange, ...props }: PriceRangeProps) {
  const { range, start, refine, canRefine } = useRange(props);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [startMin, startMax] = start;

  // Keep local inputs in sync when the refinement changes elsewhere (e.g.
  // cleared from the current-refinements chips). `start` is a new array on every
  // render, so we depend on its primitive bounds rather than the reference to
  // avoid an update loop.
  useEffect(() => {
    setFrom(toInputValue(startMin));
    setTo(toInputValue(startMax));
  }, [startMin, startMax]);

  if (!canRefine) {
    return null;
  }

  function apply() {
    const min = from === '' ? undefined : Number(from);
    const max = to === '' ? undefined : Number(to);
    refine([min, max]);
    onChange?.();
  }

  return (
    <View>
      <View style={styles.inputs}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={`$${range.min ?? 0}`}
          value={from}
          onChangeText={setFrom}
        />
        <Text style={styles.separator}>to</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={`$${range.max ?? 0}`}
          value={to}
          onChangeText={setTo}
        />
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={apply}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#f4f4f4',
    borderRadius: 4,
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 10,
    color: '#888',
  },
  applyButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#252b33',
    borderRadius: 4,
  },
  applyText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
