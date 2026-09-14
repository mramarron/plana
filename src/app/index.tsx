import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/db';

const slides = [
  {
    id: 1,
    title: 'Capture every money move',
    description: 'Add income, expenses, and loans with notes and dates so your records stay accurate as life changes.',
    accent: '#5B8DEF',
    bullets: ['Income', 'Expenses', 'Loans'],
    amount: '+$4,200',
    trend: 'monthly income',
  },
  {
    id: 2,
    title: 'Stay organised with categories',
    description: 'Reuse saved categories like Rent, Groceries, Allowance, and Repayment so each entry is consistent and easy to review.',
    accent: '#22C55E',
    bullets: ['Saved categories', 'Quick reuse', 'Cleaner records'],
    amount: '$1,420',
    trend: 'this month',
  },
  {
    id: 3,
    title: 'See the full story in overview',
    description: 'Turn transaction history into insight with live summaries, date filters, and chart views that reflect the way you actually spend.',
    accent: '#F59E0B',
    bullets: ['Live overview', 'Date filters', 'Trend charts'],
    amount: '+18.4%',
    trend: 'net growth',
  },
] as const;

export default function WelcomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const progress = useRef(new Animated.Value(activeIndex)).current;
  const router = useRouter();

  if (hasSeenOnboarding()) {
    return <Redirect href="/(app)/overview" />;
  }

  useEffect(() => {
    Animated.spring(progress, {
      toValue: activeIndex,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, progress]);

  const activeSlide = slides[activeIndex];

  const handleLaunch = () => {
    markOnboardingSeen();
    router.replace('/(app)/overview');
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <ThemedView style={styles.brandPill}>
            <ThemedText type="smallBold">Plana</ThemedText>
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary">
            Personal finance
          </ThemedText>
        </View>

        <View style={styles.carouselContainer}>
          {slides.map((slide, index) => {
            const translateX = progress.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [-46, 0, 46],
              extrapolate: 'clamp',
            });
            const scale = progress.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.9, 1, 0.9],
              extrapolate: 'clamp',
            });
            const opacity = progress.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });

            const isVisible = index === activeIndex;

            return (
              <Animated.View
                key={slide.id}
                pointerEvents="none"
                style={[
                  styles.slideCard,
                  {
                    opacity,
                    backgroundColor: slide.accent,
                    transform: [{ translateX }, { scale }],
                    zIndex: isVisible ? 2 : 1,
                  },
                ]}>
                <View style={styles.cardTopRow}>
                  <ThemedText style={styles.cardBadge}>Live overview</ThemedText>
                  <ThemedText type="smallBold" style={styles.cardAmount}>
                    {slide.amount}
                  </ThemedText>
                </View>

                <ThemedText type="subtitle" style={styles.slideTitle}>
                  {slide.title}
                </ThemedText>

                <View style={styles.featureRow}>
                  {slide.bullets.map((item) => (
                    <ThemedView key={item} style={styles.featureChip}>
                      <ThemedText type="smallBold" style={styles.featureText}>
                        {item}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricBubble}>
                    <ThemedText type="small">Income</ThemedText>
                    <ThemedText type="smallBold">{slide.amount}</ThemedText>
                  </View>
                  <View style={styles.metricBubble}>
                    <ThemedText type="small">Focus</ThemedText>
                    <ThemedText type="smallBold">{slide.trend}</ThemedText>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.textBlock}>
          <ThemedText type="title" style={styles.mainTitle}>
            {activeSlide.title}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.description}>
            {activeSlide.description}
          </ThemedText>
        </View>

        <View style={styles.dotsRow}>
          {slides.map((slide, index) => (
            <Pressable
              key={slide.id}
              accessibilityRole="button"
              onPress={() => setActiveIndex(index)}
              style={[
                styles.dot,
                {
                  width: index === activeIndex ? 28 : 10,
                  backgroundColor:
                    index === activeIndex ? slide.accent : theme.backgroundSelected,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveIndex((previous) => Math.max(previous - 1, 0))}
            style={[styles.secondaryAction, { opacity: activeIndex === 0 ? 0.4 : 1 }]}
            disabled={activeIndex === 0}>
            <ThemedText type="smallBold">Back</ThemedText>
          </Pressable>

          {activeIndex < slides.length - 1 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveIndex((previous) => Math.min(previous + 1, slides.length - 1))}
              style={styles.primaryAction}>
              <ThemedText type="smallBold" style={styles.primaryActionText}>
                Next
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={handleLaunch} style={styles.primaryAction}>
              <ThemedText type="smallBold" style={styles.primaryActionText}>
                Launch app
              </ThemedText>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  brandPill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    backgroundColor: '#5B8DEF20',
  },
  carouselContainer: {
    width: '100%',
    marginBottom: Spacing.five,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideCard: {
    position: 'absolute',
    width: '100%',
    maxWidth: 380,
    minHeight: 280,
    borderRadius: 30,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 20 },
    elevation: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  cardBadge: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.88,
  },
  cardAmount: {
    color: '#ffffff',
    fontSize: 18,
  },
  slideTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
    width: '80%',
    marginBottom: Spacing.three,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  featureChip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  featureText: {
    color: '#ffffff',
    fontSize: 11,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricBubble: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  textBlock: {
    width: '100%',
    marginBottom: Spacing.three,
  },
  mainTitle: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  description: {
    textAlign: 'center',
    maxWidth: 430,
    alignSelf: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
  dot: {
    height: 10,
    borderRadius: 999,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#E7ECF7',
  },
  primaryAction: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#183153',
  },
  primaryActionText: {
    color: '#ffffff',
  },
});
