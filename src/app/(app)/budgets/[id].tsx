import { ArrowLeft, Pencil, TrendingDown } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { BudgetRow, getBudgets, getTransactions, TransactionRow } from '@/lib/db';

export default function BudgetDetailScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [budget, setBudget] = useState<BudgetRow | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  const loadBudgetDetail = useCallback(() => {
    const budgetId = Number(params.id);

    if (!Number.isFinite(budgetId)) {
      setBudget(null);
      setTransactions([]);
      return;
    }

    const budgets = getBudgets('monthly');
    const currentBudget = budgets.find((item) => item.id === budgetId) ?? null;

    setBudget(currentBudget);

    if (!currentBudget) {
      setTransactions([]);
      return;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthTransactions = getTransactions(1000, {
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    });

    const categoryTransactions = monthTransactions.filter(
      (item) => item.category === currentBudget.category && item.type === 'expense'
    );

    setTransactions(categoryTransactions);
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      loadBudgetDetail();
    }, [loadBudgetDetail])
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
      balanceTint: '#38BDF8',
    }),
    [colors, isDark]
  );

  const summary = useMemo(() => {
    const spent = transactions.reduce((sum, item) => sum + Number(item.amount), 0);
    const remaining = (budget?.limit_amount ?? 0) - spent;
    const progress = budget && budget.limit_amount > 0 ? Math.min((spent / budget.limit_amount) * 100, 100) : 0;

    return {
      spent,
      remaining,
      progress,
    };
  }, [budget, transactions]);

  const monthLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  if (!budget) {
    return (
      <>
        <Stack.Screen options={{ title: 'Budget details' }} />
        <View
          style={[
            styles.container,
            {
              backgroundColor: palette.background,
              paddingTop: insets.top,
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={18} color={palette.textSecondary} />
              <Text style={[styles.backText, { color: palette.textSecondary }]}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.emptyCard, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>Budget not found.</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: budget.category }} />
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={18} color={palette.textSecondary} />
              <Text style={[styles.backText, { color: palette.textSecondary }]}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}
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
              <Text style={[styles.editButtonText, { color: palette.textSecondary }]}>Edit</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[
              styles.card,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <TrendingDown size={20} color={palette.expenseTint} />
              </View>

              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardLabel, { color: palette.textSecondary }]}>Category budget</Text>
                <Text style={[styles.cardTitle, { color: palette.text }]}>{budget.category}</Text>
              </View>
            </View>

            <Text style={[styles.cardAmount, { color: palette.text }]}>
              MWK{budget.limit_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>

            <Text style={[styles.cardMonth, { color: palette.textSecondary }]}>{monthLabel}</Text>

            <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(summary.progress, 100)}%`,
                    backgroundColor: summary.remaining < 0 ? palette.expenseTint : palette.incomeTint,
                  },
                ]}
              />
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>Spent</Text>
                <Text style={[styles.metricValue, { color: palette.text }]}>
                  MWK{summary.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>Left</Text>
                <Text style={[styles.metricValue, { color: summary.remaining < 0 ? palette.expenseTint : palette.incomeTint }]}>
                  MWK{Math.abs(summary.remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={[
              styles.listCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Transactions this month</Text>

            {transactions.length === 0 ? (
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No expense transactions have been recorded for {budget.category} this month.
              </Text>
            ) : (
              transactions.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.transactionItem,
                    { backgroundColor: palette.surfaceStrong, borderColor: palette.border },
                  ]}
                >
                  <View style={styles.transactionMain}>
                    <Text style={[styles.transactionNote, { color: palette.text }]}>{item.note || 'No note'}</Text>
                    <Text style={[styles.transactionDate, { color: palette.textSecondary }]}>
                      {new Date(item.occurred_at).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <Text style={[styles.transactionAmount, { color: palette.expenseTint }]}>-
                    MWK{Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))
            )}
          </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EF44441A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  cardAmount: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: '900',
  },
  cardMonth: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    marginTop: 16,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  metricsRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#00000008',
    borderRadius: 12,
    padding: 10,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
  },
  listCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  transactionItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  transactionMain: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 14,
    fontWeight: '700',
  },
  transactionDate: {
    marginTop: 4,
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
