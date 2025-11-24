import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { theme } from '@/theme';

export default function OrderLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Detail Pesanan',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerLeft: () =>
          router.canGoBack() ? (
            <TouchableOpacity
              accessibilityLabel="Kembali"
              onPress={() => router.back()}
              style={styles.backButton}
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
