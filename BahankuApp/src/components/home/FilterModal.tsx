import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { X, Check } from 'lucide-react-native';

import { theme } from '@/theme';
import { formatCurrency } from '@/libs/currency';

export interface FilterOptions {
  category: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  categories: { label: string; value: string }[];
  initialFilters?: Partial<FilterOptions>;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'name_asc', label: 'Nama A-Z' },
] as const;

export const FilterModal = ({
  visible,
  onClose,
  onApply,
  categories,
  initialFilters,
}: FilterModalProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sortBy: 'newest',
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters, visible]);

  const handleReset = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'newest',
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.minPrice !== '',
    filters.maxPrice !== '',
    filters.inStock,
    filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter & Urutkan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Kategori */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <View style={styles.chipContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.chip,
                      filters.category === cat.value && styles.chipActive,
                    ]}
                    onPress={() => setFilters((prev) => ({ ...prev, category: cat.value }))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.category === cat.value && styles.chipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rentang Harga */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rentang Harga</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    value={filters.minPrice}
                    onChangeText={(text) =>
                      setFilters((prev) => ({ ...prev, minPrice: text.replace(/[^0-9]/g, '') }))
                    }
                  />
                </View>
                <Text style={styles.priceSeparator}>-</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="∞"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    value={filters.maxPrice}
                    onChangeText={(text) =>
                      setFilters((prev) => ({ ...prev, maxPrice: text.replace(/[^0-9]/g, '') }))
                    }
                  />
                </View>
              </View>
            </View>

            {/* Ketersediaan Stok */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFilters((prev) => ({ ...prev, inStock: !prev.inStock }))}
              >
                <View style={[styles.checkbox, filters.inStock && styles.checkboxActive]}>
                  {filters.inStock && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Hanya tampilkan produk tersedia</Text>
              </TouchableOpacity>
            </View>

            {/* Urutkan */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Urutkan</Text>
              <View style={styles.sortContainer}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      filters.sortBy === option.value && styles.sortOptionActive,
                    ]}
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, sortBy: option.value as FilterOptions['sortBy'] }))
                    }
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        filters.sortBy === option.value && styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                Terapkan {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  priceSeparator: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  sortContainer: {
    gap: theme.spacing.sm,
  },
  sortOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  sortOptionActive: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  sortOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  sortOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  applyButton: {
    flex: 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
