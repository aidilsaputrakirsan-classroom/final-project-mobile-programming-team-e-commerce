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
  ChefHat,
  Tag,
  Percent,
  Moon,
  Sun,
} from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { theme, useAppTheme } from '@/theme';
import { useUIStore } from '@/store/ui.store';

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
  const theme = useAppTheme();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={[
          styles.menuItemLabel, 
          { color: theme.colors.text },
          isDestructive && { color: theme.colors.error }
        ]}>
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
  const theme = useAppTheme();
  const { isDarkMode, toggleDarkMode } = useUIStore();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profil</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
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
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{displayName}</Text>
            <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>{user?.email || '-'}</Text>
            {isAdmin ? (
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Admin</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Aktivitas</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
            <MenuItem
              icon={<Package size={20} color={theme.colors.primary} />}
              label="Pesanan Saya"
              onPress={() => router.push('/(tabs)/orders')}
            />
            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
            <MenuItem
              icon={<Heart size={20} color={theme.colors.error} />}
              label="Resep Favorit"
              onPress={() => router.push('/favorites')}
            />
          </View>
        </View>

        {/* Admin Section */}
        {isAdmin ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Admin</Text>
            <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
              <MenuItem
                icon={<ShoppingBag size={20} color={theme.colors.primary} />}
                label="Kelola Produk"
                onPress={() => router.push('/admin/products')}
              />
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              <MenuItem
                icon={<Shield size={20} color={theme.colors.secondary} />}
                label="Kelola Pesanan"
                onPress={() => router.push('/admin/orders')}
              />
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              <MenuItem
                icon={<ChefHat size={20} color={theme.colors.warning} />}
                label="Kelola Resep"
                onPress={() => router.push('/admin/recipes')}
              />
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              <MenuItem
                icon={<Tag size={20} color={theme.colors.info} />}
                label="Kelola Kategori"
                onPress={() => router.push('/admin/categories')}
              />
              <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
              <MenuItem
                icon={<Percent size={20} color={theme.colors.error} />}
                label="Kelola Diskon"
                onPress={() => router.push('/admin/discounts')}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Pengaturan</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
            <MenuItem
              icon={<Settings size={20} color={theme.colors.textSecondary} />}
              label="Pengaturan Akun"
              onPress={() => router.push('/profile/edit')}
            />
            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  {isDarkMode ? <Moon size={20} color={theme.colors.primary} /> : <Sun size={20} color={theme.colors.warning} />}
                  <Text style={[styles.menuItemLabel, { color: theme.colors.text }]}>Mode Gelap</Text>
                </View>
                <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
             </View>
            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
            <MenuItem
              icon={<HelpCircle size={20} color={theme.colors.textSecondary} />}
              label="Bantuan & FAQ"
              onPress={() => router.push('/profile/help')}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
            <MenuItem
              icon={<LogOut size={20} color={theme.colors.error} />}
              label="Keluar"
              onPress={handleLogout}
              isDestructive
            />
          </View>
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>BahanKu v1.0.0</Text>
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
