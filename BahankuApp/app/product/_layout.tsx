import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { theme } from '@/theme';

export default function ProductLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitle: 'Detail Produk',
        headerBackTitle: 'Kembali',
        headerTitleAlign: 'center',
        headerLeft: () =>
          router.canGoBack() ? (
            <TouchableOpacity
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color={theme.colors.text} />
            </TouchableOpacity>
          ) : null,
      }}
    />
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});
