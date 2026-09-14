import {
  Calendar,
  HeartHandshake,
  Home,
  PiggyBank,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation } from 'expo-router';

import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Data state
const MOCK_FINANCES = {
  monthlyIncome: 4500,
  monthlyExpenses: 1250,
  weeklyIncome: 1125,
  weeklyExpenses: 312.5,
  chartValues: [42, 56, 49, 72, 61, 90, 83, 97],
  series: [24, 36, 28, 44, 35, 62, 58, 78],
};

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const palette = {
    background: colors.background,
    surface: colors.backgroundElement,
    surfaceStrong: isDark ? '#1E293B' : '#F8FAFC',
    border: isDark ? '#334155' : '#E2E8F0',
    text: colors.text,
    textSecondary: colors.textSecondary,
    muted: isDark ? '#94A3B8' : '#64748B',
    toggleBackground: colors.backgroundElement,
    tabBarTrack: isDark ? '#334155' : '#E2E8F0',
    titheCard: isDark ? '#7C2D1220' : '#FFF7ED',
    titheBorder: isDark ? '#F59E0B40' : '#FCD34D',
    titheTitle: isDark ? '#F59E0B' : '#B45309',
    titheSubtitle: isDark ? '#D97706' : '#92400E',
  };
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const tabBarStyle = {
    position: 'absolute' as const,
    left: 20,
    right: 20,
    bottom: 18,
    borderTopWidth: 0,
    borderRadius: 28,
    height: 58,
    paddingHorizontal: 8,
    marginHorizontal: 40,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    opacity: tabBarVisible ? 1 : 0,
    transform: [{ translateY: tabBarVisible ? 0 : 64 }],
    pointerEvents: tabBarVisible ? 'auto' : 'none',
  };

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const delta = currentY - lastScrollY.current;

      if (currentY > 24 && delta > 0 && tabBarVisible) {
        setTabBarVisible(false);
      } else if (currentY < 16 && delta < 0 && !tabBarVisible) {
        setTabBarVisible(true);
      }

      lastScrollY.current = currentY;
    },
    [tabBarVisible]
  );

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle,
    });
  }, [navigation, tabBarStyle]);

  // Financial Calculations
  const rawIncome =
    period === 'monthly' ? MOCK_FINANCES.monthlyIncome : MOCK_FINANCES.weeklyIncome;
  const expenses =
    period === 'monthly' ? MOCK_FINANCES.monthlyExpenses : MOCK_FINANCES.weeklyExpenses;

  // 1. Calculate Tithe (10% of gross income)
  const tithe = rawIncome * 0.1;
  const disposableIncome = rawIncome - tithe;

  // 2. Budget Allocations on remaining income
  const needs = disposableIncome * 0.5; // 50%
  const wants = disposableIncome * 0.3; // 30%
  const savings = disposableIncome * 0.2; // 20%

  const netBalance = rawIncome - expenses - tithe;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header & Toggle */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Financial Overview</Text>
            <Text style={[styles.title, { color: palette.text }]}>Dashboard</Text>
          </View>

          {/* Period Toggle Selector */}
          <View
            style={[
              styles.toggleContainer,
              {
                backgroundColor: palette.toggleBackground,
                borderColor: palette.border,
                borderWidth: 1,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.toggleButton,
                period === 'weekly' && styles.activeToggle,
              ]}
              onPress={() => setPeriod('weekly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: period === 'weekly' ? palette.text : palette.textSecondary },
                  period === 'weekly' && styles.activeToggleText,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                period === 'monthly' && styles.activeToggle,
              ]}
              onPress={() => setPeriod('monthly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: period === 'monthly' ? palette.text : palette.textSecondary },
                  period === 'monthly' && styles.activeToggleText,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Balance Hero Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[
            styles.heroCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.heroCardHeader}>
            <Text style={[styles.heroLabel, { color: palette.textSecondary }]}>
              Total Net Balance ({period})
            </Text>
            <Wallet size={20} color="#38BDF8" />
          </View>
          <Text style={[styles.heroBalance, { color: palette.text }]}>
            MWK{netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B9811A' }]}>
                <TrendingUp size={16} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Income</Text>
                <Text style={[styles.statValue, { color: palette.text }]}>+MWK{rawIncome.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#EF44441A' }]}>
                <TrendingDown size={16} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Spent</Text>
                <Text style={[styles.statValue, { color: palette.text }]}>-MWK{expenses.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Chart Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[
            styles.sectionContainer,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Activity Trend</Text>
            <Calendar size={18} color="#94A3B8" />
          </View>

          {/* Simple Custom Bar Visualizer */}
          <View style={styles.chartContainer}>
            {MOCK_FINANCES.chartValues.map((val, idx) => {
              const expenseVal = MOCK_FINANCES.series[idx];
              const maxHeight = 100;
              return (
                <View key={idx} style={styles.barGroup}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: (val / 100) * maxHeight,
                          backgroundColor: '#38BDF8',
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: (expenseVal / 100) * maxHeight,
                          backgroundColor: '#EF4444',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[styles.legendText, { color: palette.textSecondary }]}>Income Stream</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.legendText, { color: palette.textSecondary }]}>Expenses</Text>
            </View>
          </View>
        </Animated.View>

        {/* Tithe Card */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={[
            styles.titheCard,
            {
              backgroundColor: palette.titheCard,
              borderColor: palette.titheBorder,
            },
          ]}
        >
          <View style={styles.titheHeader}>
            <View style={styles.titheTitleGroup}>
              <View style={styles.titheIconBg}>
                <HeartHandshake size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.titheTitle, { color: palette.titheTitle }]}>Tithe Allocation (10%)</Text>
                <Text style={[styles.titheSubtitle, { color: palette.titheSubtitle }]}>First fruits of total {period} income</Text>
              </View>
            </View>
            <Text style={[styles.titheAmount, { color: palette.titheTitle }]}>
              MWK{tithe.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </Animated.View>

        {/* 50 / 30 / 20 Rule Breakdown Section */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={[
            styles.sectionContainer,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Budget Breakdown (50 / 30 / 20)</Text>

          {/* Needs: 50% */}
          <View style={styles.allocationRow}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#3B82F61A' }]}>
              <Home size={18} color="#3B82F6" />
            </View>
            <View style={styles.allocationContent}>
              <View style={styles.allocationMeta}>
                <Text style={[styles.allocationName, { color: palette.textSecondary }]}>Needs (50%)</Text>
                <Text style={[styles.allocationValue, { color: palette.text }]}>
                  MWK{needs.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: palette.tabBarTrack }]}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '50%', backgroundColor: '#3B82F6' },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Wants: 30% */}
          <View style={styles.allocationRow}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#EC48991A' }]}>
              <ShoppingBag size={18} color="#EC4899" />
            </View>
            <View style={styles.allocationContent}>
              <View style={styles.allocationMeta}>
                <Text style={[styles.allocationName, { color: palette.textSecondary }]}>Wants (30%)</Text>
                <Text style={[styles.allocationValue, { color: palette.text }]}>
                  MWK{wants.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: palette.tabBarTrack }]}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '30%', backgroundColor: '#EC4899' },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Save: 20% */}
          <View style={styles.allocationRow}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#10B9811A' }]}>
              <PiggyBank size={18} color="#10B981" />
            </View>
            <View style={styles.allocationContent}>
              <View style={styles.allocationMeta}>
                <Text style={[styles.allocationName, { color: palette.textSecondary }]}>Savings (20%)</Text>
                <Text style={[styles.allocationValue, { color: palette.text }]}>
                  MWK{savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: palette.tabBarTrack }]}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '20%', backgroundColor: '#10B981' },
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#38BDF8',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeToggleText: {
    color: '#0F172A',
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  heroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  heroBalance: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  sectionContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  chartContainer: {
    height: 110,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  barGroup: {
    alignItems: 'center',
  },
  barTrack: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barFill: {
    width: 6,
    borderRadius: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  titheCard: {
    backgroundColor: '#7C2D1220',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B40',
    marginBottom: 16,
  },
  titheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titheTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titheIconBg: {
    backgroundColor: '#F59E0B20',
    padding: 10,
    borderRadius: 12,
  },
  titheTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
  },
  titheSubtitle: {
    fontSize: 11,
    color: '#D97706',
  },
  titheAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryIconBg: {
    padding: 10,
    borderRadius: 12,
  },
  allocationContent: {
    flex: 1,
  },
  allocationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  allocationName: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  allocationValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});