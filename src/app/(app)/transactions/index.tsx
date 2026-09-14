import {
    ArrowDownLeft,
    ArrowUpRight,
    BadgeDollarSign,
    Plus,
    ReceiptText,
} from 'lucide-react-native';
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

import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { getTransactions, TransactionRow } from '@/lib/db';

const quickActions = [
  { label: 'Income', icon: ArrowUpRight, tint: '#10B981', bg: '#10B9811A' },
  { label: 'Expense', icon: ArrowDownLeft, tint: '#EF4444', bg: '#EF44441A' },
  { label: 'Loan', icon: BadgeDollarSign, tint: '#A78BFA', bg: '#A78BFA1A' },
];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  const loadTransactions = useCallback(() => {
    setTransactions(getTransactions(20));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
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
      toggleBackground: colors.backgroundElement,
      tabBarTrack: isDark ? '#334155' : '#E2E8F0',
      incomeTint: '#10B981',
      expenseTint: '#EF4444',
      loanTint: '#A78BFA',
      balanceTint: '#38BDF8',
    }),
    [colors, isDark]
  );

  const summary = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const loans = transactions
      .filter((item) => item.type === 'loan')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      income,
      expenses,
      loans,
      net: income - expenses - loans,
    };
  }, [transactions]);

  return (
    <>
      <Stack.Screen options={{ title: 'Transactions' }} />
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
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Cash flow</Text>
              <Text style={[styles.title, { color: palette.text }]}>Transactions</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.secondaryAction, { borderColor: palette.border, backgroundColor: palette.surfaceStrong }]}
                onPress={() => router.push('/(app)/transactions/categories')}
              >
                <Text style={[styles.secondaryActionText, { color: palette.text }]}>Categories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryAction, { backgroundColor: palette.balanceTint }]}
                onPress={() => router.push('/(app)/transactions/new')}
              >
                <Plus size={18} color="#0F172A" />
                <Text style={styles.primaryActionText}>New</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

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
              <Text style={[styles.heroLabel, { color: palette.textSecondary }]}>Net cash flow</Text>
              <ReceiptText size={20} color={palette.balanceTint} />
            </View>

            <Text style={[styles.heroBalance, { color: palette.text }]}>
              MWK{summary.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>

            <View style={styles.summaryGrid}>
              <View style={[styles.summaryItem, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}>
                <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Income</Text>
                <Text style={[styles.summaryValue, { color: palette.incomeTint }]}>
                  +MWK{summary.income.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.summaryItem, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}>
                <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Expenses</Text>
                <Text style={[styles.summaryValue, { color: palette.expenseTint }]}>
                  -MWK{summary.expenses.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.summaryItem, { backgroundColor: palette.surfaceStrong, borderColor: palette.border }]}>
                <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Loans</Text>
                <Text style={[styles.summaryValue, { color: palette.loanTint }]}>
                  -MWK{summary.loans.toLocaleString()}
                </Text>
              </View>
            </View>
          </Animated.View>

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
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Quick add</Text>

            <View style={styles.quickActionRow}>
              {quickActions.map(({ label, icon: Icon, tint, bg }) => (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.9}
                  style={[
                    styles.quickActionButton,
                    {
                      backgroundColor: bg,
                      borderColor: palette.border,
                    },
                  ]}
                  onPress={() => router.push(`/(app)/transactions/new?type=${label.toLowerCase()}`)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: tint }]}>
                    <Icon size={16} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: palette.text }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={[
              styles.sectionContainer,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent activity</Text>
              <Text style={[styles.sectionLink, { color: palette.textSecondary }]}>View all</Text>
            </View>

            {transactions.length === 0 ? (
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No transactions yet. Add your first income, expense, or loan.
              </Text>
            ) : (
              transactions.map((item) => {
                const amount = Number(item.amount);
                const isIncome = item.type === 'income';
                const tone =
                  item.type === 'income'
                    ? '#10B981'
                    : item.type === 'loan'
                      ? '#A78BFA'
                      : '#EF4444';

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.activityItem,
                      {
                        backgroundColor: palette.surfaceStrong,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <View style={styles.activityLeft}>
                      <View style={[styles.activityIcon, { backgroundColor: `${tone}22` }]}>
                        {item.type === 'income' ? (
                          <ArrowUpRight size={16} color={tone} />
                        ) : item.type === 'loan' ? (
                          <BadgeDollarSign size={16} color={tone} />
                        ) : (
                          <ArrowDownLeft size={16} color={tone} />
                        )}
                      </View>

                      <View style={styles.activityTextWrap}>
                        <Text style={[styles.activityTitle, { color: palette.text }]}>
                          {item.note || item.category}
                        </Text>
                        <Text style={[styles.activitySubtitle, { color: palette.textSecondary }]}>
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.activityMeta}>
                      <Text
                        style={[
                          styles.amount,
                          {
                            color: isIncome ? palette.incomeTint : palette.text,
                          },
                        ]}
                      >
                        {isIncome ? '+' : '-'}MWK{Math.abs(amount).toLocaleString()}
                      </Text>
                      <Text style={[styles.activityDate, { color: palette.muted }]}>
                        {new Date(item.occurred_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </Animated.View>

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
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Transaction buckets</Text>

            <View style={styles.bucketRow}>
              <View style={styles.bucketMeta}>
                <Text style={[styles.bucketLabel, { color: palette.textSecondary }]}>Income</Text>
                <Text style={[styles.bucketValue, { color: palette.text }]}>MWK{summary.income.toLocaleString()}</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: palette.tabBarTrack }]}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '70%', backgroundColor: palette.incomeTint },
                  ]}
                />
              </View>
            </View>

            <View style={styles.bucketRow}>
              <View style={styles.bucketMeta}>
                <Text style={[styles.bucketLabel, { color: palette.textSecondary }]}>Expenses</Text>
                <Text style={[styles.bucketValue, { color: palette.text }]}>MWK{summary.expenses.toLocaleString()}</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: palette.tabBarTrack }]}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '45%', backgroundColor: palette.expenseTint },
                  ]}
                />
              </View>
            </View>

            <View style={styles.bucketRow}>
              <View style={styles.bucketMeta}>
                <Text style={[styles.bucketLabel, { color: palette.textSecondary }]}>Loans</Text>
                <Text style={[styles.bucketValue, { color: palette.text }]}>MWK{summary.loans.toLocaleString()}</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: palette.tabBarTrack }]}>
                <View
                  style={[
                    styles.progressBar,
                    { width: '30%', backgroundColor: palette.loanTint },
                  ]}
                />
              </View>
            </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryActionText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 14,
  },
  heroBalance: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
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
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    gap: 8,
  },
  quickActionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 11,
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  bucketRow: {
    marginBottom: 14,
  },
  bucketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bucketLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  bucketValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
