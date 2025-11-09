import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@/theme';
import { Product } from '@/types/product';

interface RecommendationsSectionProps {
  products: Product[];
  onProductPress: (product: Product) => void;
}

export const RecommendationsSection = ({
  products,
  onProductPress,
}: RecommendationsSectionProps) => {
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rekomendasi untuk kamu</Text>
        <TouchableOpacity>
          <ChevronRight size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationScroll}
      >
        {products.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recommendationCard}
            onPress={() => onProductPress(item)}
          >
            <View style={styles.recommendationImageContainer}>
              <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
                style={styles.recommendationImage}
              />
            </View>
            <Text style={styles.recommendationName} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  recommendationScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  recommendationCard: {
    width: 120,
    alignItems: 'center',
  },
  recommendationImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  recommendationImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  recommendationName: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
});
