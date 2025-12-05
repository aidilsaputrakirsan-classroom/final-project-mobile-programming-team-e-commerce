import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { Heart, Clock, Users } from 'lucide-react-native';

import { theme } from '@/theme';
import { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
}

export function RecipeCard({
  recipe,
  isFavorite = false,
  onPress,
  onToggleFavorite,
  showFavoriteButton = true,
}: RecipeCardProps) {
  const { title, description, image_url, cooking_time, servings, difficulty } = recipe;

  // Map difficulty ke label bahasa Indonesia
  const difficultyLabel = {
    mudah: 'Mudah',
    sedang: 'Sedang',
    sulit: 'Sulit',
  };

  // Map difficulty ke warna
  const difficultyColor = {
    mudah: theme.colors.success,
    sedang: theme.colors.warning,
    sulit: theme.colors.error,
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: image_url || 'https://via.placeholder.com/300x200?text=Resep',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Tombol favorit */}
        {showFavoriteButton && onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={isFavorite ? theme.colors.error : '#FFFFFF'}
              fill={isFavorite ? theme.colors.error : 'transparent'}
            />
          </TouchableOpacity>
        )}

        {/* Badge kesulitan */}
        {difficulty && (
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor[difficulty] || theme.colors.primary },
            ]}
          >
            <Text style={styles.difficultyText}>
              {difficultyLabel[difficulty] || difficulty}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Info waktu dan porsi */}
        <View style={styles.infoRow}>
          {cooking_time && (
            <View style={styles.infoItem}>
              <Clock size={14} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{cooking_time} menit</Text>
            </View>
          )}
          {servings && (
            <View style={styles.infoItem}>
              <Users size={14} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{servings} porsi</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: theme.colors.border,
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
