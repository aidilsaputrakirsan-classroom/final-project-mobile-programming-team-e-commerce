import { Search, Camera } from 'lucide-react-native';
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import { theme } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onCameraPress?: () => void;
}

export const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  onCameraPress,
}: SearchBarProps) => {
  return (
    <View style={styles.section}>
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari bahan dapur..."
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={onCameraPress}
            activeOpacity={0.8}
          >
            <Camera size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  searchWrapper: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  cameraButton: {
    padding: theme.spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: theme.borderRadius.full,
  },
});
