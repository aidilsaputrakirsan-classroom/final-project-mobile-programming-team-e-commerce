import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen, Zap, Star, Percent, LucideIcon } from 'lucide-react-native';
import { theme } from '@/theme';

interface ActionItem {
  icon: LucideIcon;
  label: string;
  color: string;
}

const ACTIONS: ActionItem[] = [
  { icon: BookOpen, label: 'Resep', color: '#F97316' },
  { icon: Zap, label: 'Flash', color: '#EAB308' },
  { icon: Star, label: 'Best', color: '#3B82F6' },
  { icon: Percent, label: 'Diskon', color: '#EF4444' },
];

export const QuickActions = () => {
  return (
    <View style={styles.shortcutGrid}>
      {ACTIONS.map((action) => {
        const IconComponent = action.icon;
        return (
          <TouchableOpacity key={action.label} style={styles.shortcutItem}>
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
