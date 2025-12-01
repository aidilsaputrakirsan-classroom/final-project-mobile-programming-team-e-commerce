import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { theme } from '@/theme';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
}

const clampValue = (value: number, min: number, max: number) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

export function QuantityStepper({
  value,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
  onChange,
}: QuantityStepperProps) {
  const safeMax = Math.max(min, max);
  const handleDecrease = () => {
    const nextValue = clampValue(value - 1, min, safeMax);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleIncrease = () => {
    const nextValue = clampValue(value + 1, min, safeMax);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const disableDecrease = value <= min;
  const disableIncrease = value >= safeMax;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disableDecrease && styles.buttonDisabled]}
        onPress={handleDecrease}
        disabled={disableDecrease}
        activeOpacity={0.7}
      >
        <Minus
          size={18}
          color={disableDecrease ? theme.colors.textSecondary : theme.colors.text}
        />
      </TouchableOpacity>

      <Text style={styles.value}>{value}</Text>

      <TouchableOpacity
        style={[styles.button, disableIncrease && styles.buttonDisabled]}
        onPress={handleIncrease}
        disabled={disableIncrease}
        activeOpacity={0.7}
      >
        <Plus
          size={18}
          color={disableIncrease ? theme.colors.textSecondary : theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  value: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.xs,
  },
});
