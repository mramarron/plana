import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const chartBars = [40, 68, 52, 88, 62, 94, 70, 82];

export default function DashboardScreen() {
  const safeAreaInsets = useSafeAreaInsets();

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
          <ThemedText type="small" themeColor="textSecondary">Total balance</ThemedText>
          <ThemedText type="title" style={styles.balanceValue}>$12,480</ThemedText>
          <View style={styles.inlineMeta}>
            <ThemedText type="smallBold" style={styles.positiveText}>+$1,840</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">vs last month</ThemedText>
          </View>
        </ThemedView>

        <View style={styles.gridRow}>
          <ThemedView style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">Income</ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>$5.3k</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">Spending</ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>$2.7k</ThemedText>
          </ThemedView>
        </View>

        <ThemedView style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <ThemedText type="smallBold">Cash flow</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">7 days</ThemedText>
          </View>

          <View style={styles.chartBars}>
            {chartBars.map((height, index) => (
              <View key={`${height}-${index}`} style={[styles.bar, { height: `${height}%` }]} />
            ))}
          </View>
        </ThemedView>

        <View style={styles.bottomRow}>
          <ThemedView style={styles.pieCard}>
            <ThemedText type="smallBold">Budget</ThemedText>
            <View style={styles.ringWrap}>
              <View style={styles.ring}>
                <View style={styles.ringInner}>
                  <ThemedText type="smallBold">72%</ThemedText>
                </View>
              </View>
            </View>
          </ThemedView>

          <ThemedView style={styles.listCard}>
            <ThemedText type="smallBold" style={styles.listTitle}>Categories</ThemedText>
            <View style={styles.categoryRow}>
              <View style={styles.labelWrap}>
                <View style={[styles.dot, { backgroundColor: '#5B8DEF' }]} />
                <ThemedText type="small">Housing</ThemedText>
              </View>
              <ThemedText type="smallBold">$1.4k</ThemedText>
            </View>
            <View style={styles.categoryRow}>
              <View style={styles.labelWrap}>
                <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                <ThemedText type="small">Food</ThemedText>
              </View>
              <ThemedText type="smallBold">$640</ThemedText>
            </View>
            <View style={styles.categoryRow}>
              <View style={styles.labelWrap}>
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <ThemedText type="small">Travel</ThemedText>
              </View>
              <ThemedText type="smallBold">$280</ThemedText>
            </View>
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
  },
  positiveText: {
    color: '#7EE7A5',
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
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
  bar: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#5B8DEF',
    opacity: 0.9,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pieCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    marginTop: Spacing.two,
  },
  ring: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 12,
    borderColor: '#DDE7FB',
    borderTopColor: '#5B8DEF',
    borderRightColor: '#5B8DEF',
    transform: [{ rotate: '32deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F6FB',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-32deg' }],
  },
  listCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.three,
  },
  listTitle: {
    marginBottom: Spacing.two,
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
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});
