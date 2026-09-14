import { ChevronLeft, ChevronRight, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { BudgetUsageRow, deleteBudget, getBudgetsWithUsage } from '@/lib/db';

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [budgets, setBudgets] = useState<BudgetUsageRow[]>([]);

  const loadBudgets = useCallback(() => {
    setBudgets(getBudgetsWithUsage('monthly', selectedMonth));
  }, [selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets])
  );

  const palette = useMemo(
    () => ({
      background: colors.background,
      surface: colors.backgroundElement,
      surfaceStrong: isDark ? '#1E293B' : '#F8FAFC',
      border: isDark ? '#334155' : '#E2E8F0',
      text: colors.text,
      textSecondary: colors.textSecondary,
      muted: isDark ? '#94A3B8' : '#64748B',
      track: isDark ? '#334155' : '#E2E8F0',
      incomeTint: '#10B981',
      expenseTint: '#EF4444',
      loanTint: '#A78BFA',
      balanceTint: '#38BDF8',
    }),
    [colors, isDark]
  );

  const monthLabel = useMemo(
    () =>
      selectedMonth.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [selectedMonth]
  );

  const totals = useMemo(() => {
    return budgets.reduce(
      (acc, item) => {
        acc.limit += item.limit_amount;
        acc.spent += item.spent;
        acc.remaining += item.remaining;
        return acc;
      },
      { limit: 0, spent: 0, remaining: 0 }
    );
  }, [budgets]);

  const overallProgress = totals.limit > 0 ? (totals.spent / totals.limit) * 100 : 0;

  const changeMonth = (offset: number) => {
    setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const handleDelete = (id: number, category: string) => {
    Alert.alert('Delete budget', `Remove the ${category} budget for ${monthLabel}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBudget(id);
          loadBudgets();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Budgets' }} />
      <View
        style={[
          styles.container,
          {
            backgroundColor: palette.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Monthly limits</Text>
              <Text style={[styles.title, { color: palette.text }]}>Budgets</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: palette.balanceTint }]}
              onPress={() => router.push('/(app)/budgets/new')}
            >
              <Plus size={18} color="#0F172A" />
              <Text style={styles.primaryActionText}>Add</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[
              styles.summaryCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIcon}>
                <PiggyBank size={20} color={palette.incomeTint} />
              </View>

              <View style={styles.summaryTextWrap}>
                <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Budget usage</Text>
                <Text style={[styles.summaryMonth, { color: palette.text }]}>{monthLabel}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryValue, { color: palette.text }]}>
                MWK{totals.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>

              <View style={styles.monthSelector}>
                <TouchableOpacity
                  onPress={() => changeMonth(-1)}
                  style={[styles.monthNavButton, { borderColor: palette.border }]}
                >
                  <ChevronLeft size={16} color={palette.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => changeMonth(1)}
                  style={[styles.monthNavButton, { borderColor: palette.border }]}
                >
                  <ChevronRight size={16} color={palette.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(overallProgress, 100)}%`,
                    backgroundColor: totals.remaining < 0 ? palette.expenseTint : palette.incomeTint,
                  },
                ]}
              />
            </View>

            <View style={styles.summaryMeta}>
              <Text style={[styles.summaryMetaText, { color: palette.textSecondary }]}>
                Limit: MWK{totals.limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.summaryMetaText, { color: palette.textSecondary }]}>
                Remaining: MWK{totals.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </Animated.View>

          {budgets.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(150).duration(400)}
              style={[
                styles.emptyCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No budgets added yet for {monthLabel}. Create a monthly spending limit for a category to get started.
              </Text>
            </Animated.View>
          ) : (
            budgets.map((budget) => {
              const isOver = budget.remaining < 0;

              return (
                <Animated.View
                  key={budget.id}
                  entering={FadeInDown.delay(150).duration(400)}
                  style={[
                    styles.budgetCard,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.budgetHeader}>
                    <TouchableOpacity
                      style={styles.budgetTitleWrap}
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/budgets/[id]',
                          params: { id: String(budget.id) },
                        })
                      }
                    >
                      <Text style={[styles.budgetCategory, { color: palette.text }]}>{budget.category}</Text>
                      <Text style={[styles.budgetPeriod, { color: palette.textSecondary }]}>
                        Monthly budget
                      </Text>
                    </TouchableOpacity>

                    <Text style={[styles.budgetAmount, { color: isOver ? palette.expenseTint : palette.text }]}>
                      MWK{budget.limit_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View style={styles.budgetNumbers}>
                    <Text style={[styles.budgetMetric, { color: palette.textSecondary }]}>
                      Spent: MWK{budget.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.budgetMetric, { color: isOver ? palette.expenseTint : palette.incomeTint }]}>
                      {isOver ? 'Over by' : 'Left'}:{' '}
                      MWK{Math.abs(budget.remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(budget.progress, 100)}%`,
                          backgroundColor: isOver ? palette.expenseTint : palette.incomeTint,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/budgets/[id]',
                          params: { id: String(budget.id) },
                        })
                      }
                    >
                      <Text style={[styles.actionButtonText, { color: palette.textSecondary }]}>Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/budgets/new',
                          params: {
                            id: String(budget.id),
                            category: budget.category,
                            limit: String(budget.limit_amount),
                          },
                        })
                      }
                    >
                      <Pencil size={14} color={palette.textSecondary} />
                      <Text style={[styles.actionButtonText, { color: palette.textSecondary }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: `${palette.expenseTint}1A`, borderColor: `${palette.expenseTint}66` }]}
                      onPress={() => handleDelete(budget.id, budget.category)}
                    >
                      <Trash2 size={14} color={palette.expenseTint} />
                      <Text style={[styles.actionButtonText, { color: palette.expenseTint }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  subtitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  title: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: '800',
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  primaryActionText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#10B9811A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  summaryMonth: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  monthSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  monthNavButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  summaryMeta: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  budgetCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  budgetTitleWrap: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: '700',
  },
  budgetPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  budgetNumbers: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  budgetMetric: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
