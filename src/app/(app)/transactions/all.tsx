import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { getTransactions, TransactionRow } from '@/lib/db';

export default function AllTransactionsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [search, setSearch] = useState('');

  const loadTransactions = useCallback(() => {
    setTransactions(getTransactions(200));
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
      incomeTint: '#10B981',
      expenseTint: '#EF4444',
      loanTint: '#A78BFA',
    }),
    [colors, isDark]
  );

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) {
      return sortedTransactions;
    }

    const query = search.trim().toLowerCase();

    return sortedTransactions.filter((item) => {
      return (
        item.category.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        (item.note ?? '').toLowerCase().includes(query)
      );
    });
  }, [search, sortedTransactions]);

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, TransactionRow[]>();

    for (const item of filteredTransactions) {
      const key = new Date(item.occurred_at).toISOString().slice(0, 10);
      const existing = groups.get(key) ?? [];
      existing.push(item);
      groups.set(key, existing);
    }

    return Array.from(groups.entries()).map(([key, items]) => {
      const date = new Date(key);

      return {
        key,
        label: date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        items,
      };
    });
  }, [filteredTransactions]);

  return (
    <>
      <Stack.Screen options={{ title: 'All transactions' }} />
      <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: palette.text }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: palette.text }]}>All transactions</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.searchWrap, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search category, type, or note"
            placeholderTextColor={palette.muted}
            style={[styles.searchInput, { color: palette.text }]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {groupedTransactions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No transactions yet.
              </Text>
            </View>
          ) : (
            groupedTransactions.map((group) => (
              <View key={group.key} style={styles.dateSection}>
                <Text style={[styles.sectionDate, { color: palette.textSecondary }]}>{group.label}</Text>

                {group.items.map((item) => {
                  const amount = Number(item.amount);
                  const tone =
                    item.type === 'income'
                      ? palette.incomeTint
                      : item.type === 'loan'
                        ? palette.loanTint
                        : palette.expenseTint;

                  const badgeColor =
                    item.type === 'income'
                      ? '#10B9811A'
                      : item.type === 'loan'
                        ? '#A78BFA1A'
                        : '#EF44441A';

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.activityItem,
                        {
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <View style={styles.activityHeader}>
                        <View style={styles.mainInfo}>
                          <Text style={[styles.category, { color: palette.text }]}>{item.category}</Text>
                          <Text style={[styles.note, { color: palette.textSecondary }]}>
                            {item.note || 'No note'
                          }
                          </Text>
                        </View>

                        <Text style={[styles.amount, { color: tone }]}>
                          {item.type === 'income' ? '+' : '-'}MWK{Math.abs(amount).toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.metaRow}>
                        <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
                          <Text style={[styles.tag, { color: tone }]}>{item.type}</Text>
                        </View>
                        <Text style={[styles.date, { color: palette.muted }]}>
                          {new Date(item.occurred_at).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 52,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  searchWrap: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  dateSection: {
    marginBottom: 18,
  },
  sectionDate: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  activityItem: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  mainInfo: {
    flex: 1,
  },
  category: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
  },
});
