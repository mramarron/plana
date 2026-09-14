import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getTransactions, getTransactionSummary, TransactionRow } from '@/lib/db';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatCompactCurrency = (value: number) => compactCurrencyFormatter.format(value);

export default function DashboardScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [summary, setSummary] = useState(() => getTransactionSummary());
  const [transactions, setTransactions] = useState<TransactionRow[]>(() => getTransactions(50));

  useEffect(() => {
    setSummary(getTransactionSummary());
    setTransactions(getTransactions(50));
  }, []);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: 0,
        date,
      };
    });

    for (const transaction of transactions) {
      const occurredAt = new Date(transaction.occurred_at);
      const transactionDay = new Date(occurredAt);
      transactionDay.setHours(0, 0, 0, 0);

      const match = days.find((day) => day.date.getTime() === transactionDay.getTime());

      if (!match) {
        continue;
      }

      match.value += Number(transaction.amount);
    }

    const maxValue = Math.max(...days.map((day) => day.value), 1);

    return days.map((day) => ({
      ...day,
      height: maxValue === 0 ? 0 : Math.max((day.value / maxValue) * 100, day.value > 0 ? 12 : 0),
    }));
  }, [transactions]);

  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        continue;
      }

      totals[transaction.category] = (totals[transaction.category] ?? 0) + Number(transaction.amount);
    }

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [transactions]);

  const recentActivity = transactions.slice(0, 3);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{
        paddingTop: safeAreaInsets.top + Spacing.three,
        paddingBottom: safeAreaInsets.bottom + Spacing.three,
        paddingHorizontal: Spacing.three,
      }}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">Good morning</ThemedText>
            <ThemedText type="subtitle">Plana</ThemedText>
          </View>
          <ThemedView style={styles.avatar}>
            <ThemedText type="smallBold">JD</ThemedText>
          </ThemedView>
        </View>

        <ThemedView style={styles.heroCard}>
          <ThemedText type="small" themeColor="textSecondary">Net balance</ThemedText>
          <ThemedText type="title" style={styles.balanceValue}>
            {formatCurrency(summary.net)}
          </ThemedText>
          <View style={styles.inlineMeta}>
            <ThemedText type="smallBold" style={summary.net >= 0 ? styles.positiveText : styles.negativeText}>
              {summary.net >= 0 ? '+' : '-'}
              {formatCompactCurrency(Math.abs(summary.net))}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              across {summary.totalTransactions} transactions
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.gridRow}>
          <ThemedView style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">Income</ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>
              {formatCurrency(summary.income)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">Expenses</ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>
              {formatCurrency(summary.expenses)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">Loans</ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>
              {formatCurrency(summary.loans)}
            </ThemedText>
          </ThemedView>
        </View>

        <ThemedView style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <ThemedText type="smallBold">Cash flow</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Last 7 days</ThemedText>
          </View>

          <View style={styles.chartBars}>
            {chartData.map((day) => (
              <View key={day.label} style={styles.barColumn}>
                <View style={[styles.bar, { height: `${day.height}%` }]} />
              </View>
            ))}
          </View>

          <View style={styles.chartLabels}>
            {chartData.map((day) => (
              <ThemedText key={`${day.label}-label`} type="small" themeColor="textSecondary">
                {day.label}
              </ThemedText>
            ))}
          </View>
        </ThemedView>

        <View style={styles.bottomRow}>
          <ThemedView style={styles.pieCard}>
            <ThemedText type="smallBold">Top categories</ThemedText>
            {topCategories.length > 0 ? (
              <View style={styles.categoryList}>
                {topCategories.map(([category, total], index) => (
                  <View key={`${category}-${index}`} style={styles.categoryRow}>
                    <View style={styles.labelWrap}>
                      <View
                        style={[
                          styles.dot,
                          {
                            backgroundColor: ['#5B8DEF', '#22C55E', '#F59E0B'][index % 3],
                          },
                        ]}
                      />
                      <ThemedText type="small">{category}</ThemedText>
                    </View>
                    <ThemedText type="smallBold">{formatCurrency(total)}</ThemedText>
                  </View>
                ))}
              </View>
            ) : (
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
                Add expenses or loans to see category totals here.
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.listCard}>
            <ThemedText type="smallBold" style={styles.listTitle}>Recent activity</ThemedText>
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <View key={item.id} style={styles.activityRow}>
                  <View style={styles.activityMeta}>
                    <ThemedText type="smallBold">{item.category}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {new Date(item.occurred_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </ThemedText>
                  </View>

                  <ThemedText
                    type="smallBold"
                    style={item.type === 'income' ? styles.positiveText : styles.negativeText}>
                    {item.type === 'income' ? '+' : '-'}
                    {formatCurrency(Number(item.amount))}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
                No transactions yet. Add one from the app to populate this view.
              </ThemedText>
            )}
          </ThemedView>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  container: {
    width: '100%',
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#183153',
    borderRadius: 28,
    padding: Spacing.four,
    minHeight: 170,
    justifyContent: 'center',
  },
  balanceValue: {
    color: '#fff',
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  positiveText: {
    color: '#7EE7A5',
  },
  negativeText: {
    color: '#FCA5A5',
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    padding: Spacing.three,
    borderRadius: 22,
    backgroundColor: '#fff',
    minHeight: 110,
    justifyContent: 'center',
  },
  statValue: {
    marginTop: Spacing.one,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: Spacing.three,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  chartBars: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#5B8DEF',
    opacity: 0.9,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  pieCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.three,
  },
  listCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.three,
  },
  listTitle: {
    marginBottom: Spacing.two,
  },
  categoryList: {
    marginTop: Spacing.two,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  activityMeta: {
    flexShrink: 1,
  },
  emptyState: {
    marginTop: Spacing.two,
  },
});
