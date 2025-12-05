import { Check, Package, Truck, CheckCircle2, XCircle } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { theme } from '@/theme';
import { OrderStatus } from '@/types/order';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
}

const statusSteps: Array<{ status: OrderStatus; label: string; icon: typeof Package }> = [
  { status: 'diproses', label: 'Diproses', icon: Package },
  { status: 'dikirim', label: 'Dikirim', icon: Truck },
  { status: 'selesai', label: 'Selesai', icon: CheckCircle2 },
];

const statusColors = {
  diproses: '#F59E0B',
  dikirim: '#3B82F6',
  selesai: '#10B981',
  dibatalkan: '#EF4444',
};

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  // Jika dibatalkan, tampilkan view khusus
  if (currentStatus === 'dibatalkan') {
    return (
      <View style={styles.container}>
        <View style={styles.canceledContainer}>
          <View style={styles.canceledIconWrapper}>
            <XCircle size={32} color={statusColors.dibatalkan} />
          </View>
          <Text style={styles.canceledText}>Pesanan Dibatalkan</Text>
        </View>
      </View>
    );
  }

  const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus);

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        {statusSteps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isLast = index === statusSteps.length - 1;
          const IconComponent = step.icon;

          return (
            <View key={step.status} style={styles.stepContainer}>
              <View style={styles.stepContent}>
                {/* Icon Circle */}
                <View
                  style={[
                    styles.iconCircle,
                    isActive && { backgroundColor: statusColors[currentStatus] },
                  ]}
                >
                  {isActive ? (
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <IconComponent size={16} color={theme.colors.textSecondary} />
                  )}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && {
                      color: theme.colors.text,
                      fontWeight: theme.fontWeight.semibold,
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connector Line */}
              {!isLast ? (
                <View
                  style={[
                    styles.connector,
                    isActive && { backgroundColor: statusColors[currentStatus] },
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  connector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: theme.colors.border,
    zIndex: -1,
  },
  canceledContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  canceledIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canceledText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: statusColors.dibatalkan,
  },
});
