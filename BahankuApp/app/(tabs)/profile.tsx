import { useRouter } from 'expo-router';
import {
  Package,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  ShoppingBag,
} from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/theme';

// Fungsi untuk mendapatkan initials dari email atau nama
function getInitials(email?: string, name?: string): string {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'US';
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeText?: string;
  isDestructive?: boolean;
}

function MenuItem({
  icon,
  label,
  onPress,
  showBadge,
  badgeText,
  isDestructive,
}: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={[styles.menuItemLabel, isDestructive && styles.destructiveText]}>
          {label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {showBadge && badgeText ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        ) : null}
        <ChevronRight size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('Segera Hadir', `Fitur ${feature} akan segera tersedia.`);
  };

  const initials = getInitials(user?.email, user?.name);
  const displayName = user?.name || user?.email?.split('@')[0] || 'Pengguna';
  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, isAdmin && styles.adminAvatar]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {isAdmin ? (
              <View style={styles.adminBadge}>
                <Shield size={12} color="#FFFFFF" />
              </View>
            ) : null}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email || '-'}</Text>
            {isAdmin ? (
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Admin</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Package size={20} color={theme.colors.primary} />}
              label="Pesanan Saya"
              onPress={() => router.push('/(tabs)/orders')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<Heart size={20} color={theme.colors.error} />}
              label="Favorit"
              onPress={() => handleComingSoon('Favorit')}
            />
          </View>
        </View>

        {/* Admin Section */}
        {isAdmin ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon={<ShoppingBag size={20} color={theme.colors.primary} />}
                label="Kelola Produk"
                onPress={() => router.push('/admin/products')}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon={<Shield size={20} color={theme.colors.secondary} />}
                label="Kelola Pesanan"
                onPress={() => router.push('/admin/orders')}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Settings size={20} color={theme.colors.textSecondary} />}
              label="Pengaturan Akun"
              onPress={() => handleComingSoon('Pengaturan Akun')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<HelpCircle size={20} color={theme.colors.textSecondary} />}
              label="Bantuan & FAQ"
              onPress={() => handleComingSoon('Bantuan')}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<LogOut size={20} color={theme.colors.error} />}
              label="Keluar"
              onPress={handleLogout}
              isDestructive
            />
          </View>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>BahanKu v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminAvatar: {
    backgroundColor: theme.colors.secondary,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.secondary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  roleTag: {
    backgroundColor: theme.colors.secondary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  roleTagText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondary,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuItemLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md + 20 + theme.spacing.md,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  versionText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
});
