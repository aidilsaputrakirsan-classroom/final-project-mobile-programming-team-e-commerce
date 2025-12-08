import { useRouter } from 'expo-router';
import { BookOpen, Zap, Star, Percent, LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import { theme } from '@/theme';

interface ActionItem {
  icon: LucideIcon;
  label: string;
  color: string;
  route?: string;
}

const ACTIONS: ActionItem[] = [
  { icon: BookOpen, label: 'Resep', color: '#F97316', route: '/recipes' },
  { icon: Zap, label: 'Flash', color: '#EAB308' },
  { icon: Star, label: 'Best', color: '#3B82F6' },
  { icon: Percent, label: 'Diskon', color: '#EF4444', route: '/discounts' },
];

export const QuickActions = () => {
  const router = useRouter();

  const handlePress = (action: ActionItem) => {
    if (action.route) {
      router.push(action.route as never);
    } else {
      Alert.alert('Segera Hadir', `Fitur ${action.label} akan segera tersedia.`);
    }
  };

  return (
    <View style={styles.shortcutGrid}>
      {ACTIONS.map((action) => {
        const IconComponent = action.icon;
        return (
          <TouchableOpacity
            key={action.label}
            style={styles.shortcutItem}
            onPress={() => handlePress(action)}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: `${action.color}15` }]}>
              <IconComponent size={24} color={action.color} />
            </View>
            <Text style={styles.shortcutLabel}>{action.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  shortcutGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    marginTop: 0,
    marginBottom: 0,
  },
  shortcutItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  shortcutIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
