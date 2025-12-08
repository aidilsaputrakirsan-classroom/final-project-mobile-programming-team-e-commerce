import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';

import { theme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundColor: string;
  route?: string;
}

const BANNER_DATA: BannerItem[] = [
  {
    id: '1',
    title: 'Harga Hemat Minggu Ini',
    subtitle: 'Diskon hingga 35%',
    buttonText: 'Belanja Sekarang',
    backgroundColor: theme.colors.primary,
    route: '/(tabs)',
  },
  {
    id: '2',
    title: 'Resep Masakan Baru',
    subtitle: 'Temukan inspirasi masakan setiap hari',
    buttonText: 'Lihat Resep',
    backgroundColor: '#F59E0B',
    route: '/(tabs)/recipes',
  },
  {
    id: '3',
    title: 'Bahan Segar Setiap Hari',
    subtitle: 'Kualitas terjamin untuk keluarga',
    buttonText: 'Cek Produk',
    backgroundColor: '#10B981',
    route: '/(tabs)',
  },
  {
    id: '4',
    title: 'Gratis Ongkir',
    subtitle: 'Untuk pembelian minimal Rp50.000',
    buttonText: 'Mulai Belanja',
    backgroundColor: '#8B5CF6',
    route: '/(tabs)',
  },
];

const AUTO_SCROLL_INTERVAL = 4000; // 4 detik

export const PromoBanner = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto scroll
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  const startAutoScroll = () => {
    stopAutoScroll();
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNER_DATA.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / BANNER_WIDTH);
    if (index !== activeIndex && index >= 0 && index < BANNER_DATA.length) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const handleScrollBegin = () => {
    stopAutoScroll();
  };

  const handleScrollEnd = () => {
    startAutoScroll();
  };

  const handleBannerPress = (route?: string) => {
    if (route) {
      router.push(route as never);
    }
  };

  const renderBannerItem = ({ item }: { item: BannerItem }) => (
    <View style={styles.bannerContainer}>
      <View style={[styles.banner, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => handleBannerPress(item.route)}
          >
            <Text style={[styles.bannerButtonText, { color: item.backgroundColor }]}>
              {item.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {BANNER_DATA.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            activeIndex === index ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={BANNER_DATA}
        renderItem={renderBannerItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH,
          offset: BANNER_WIDTH * index,
          index,
        })}
      />
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    paddingHorizontal: theme.spacing.lg,
  },
  banner: {
    width: '100%',
    borderRadius: 16,
    padding: theme.spacing.lg,
    overflow: 'hidden',
  },
  bannerContent: {
    gap: theme.spacing.xs,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
  dotInactive: {
    backgroundColor: theme.colors.border,
  },
});
