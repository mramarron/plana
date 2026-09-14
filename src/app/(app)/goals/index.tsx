import { Pencil, Plus, Target, Trash2 } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

type Goal = {
  id: number;
  title: string;
  targetAmount: number;
  savedAmount: number;
  color: string;
  dueDate: string;
};

const initialGoals: Goal[] = [
  {
    id: 1,
    title: 'Emergency fund',
    targetAmount: 10000,
    savedAmount: 7400,
    color: '#5B8DEF',
    dueDate: '2026-12-31',
  },
  {
    id: 2,
    title: 'Travel fund',
    targetAmount: 5000,
    savedAmount: 2300,
    color: '#22C55E',
    dueDate: '2026-10-15',
  },
];

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const scrollViewRef = useRef<ScrollView>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const palette = useMemo(
    () => ({
      background: colors.background,
      surface: colors.backgroundElement,
      border: isDark ? '#334155' : '#E2E8F0',
      track: isDark ? '#1E293B' : '#E2E8F0',
      text: colors.text,
      textSecondary: colors.textSecondary,
      muted: isDark ? '#94A3B8' : '#64748B',
      field: isDark ? '#0F172A' : '#F8FAFC',
      inputBorder: isDark ? '#334155' : '#CBD5E1',
      accent: '#38BDF8',
      success: '#10B981',
      danger: '#EF4444',
    }),
    [colors, isDark]
  );

  const totals = useMemo(() => {
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);

    return {
      totalTarget,
      totalSaved,
      totalRemaining: totalTarget - totalSaved,
      progress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
  }, [goals]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setTargetAmount('');
    setSavedAmount('');
    setDueDate('');
  };

  const handleNewGoal = () => {
    resetForm();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    const parsedTarget = Number(targetAmount);
    const parsedSaved = Number(savedAmount);

    if (!cleanTitle || !Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      Alert.alert('Missing details', 'Please enter a goal title and a valid target amount.');
      return;
    }

    if (!Number.isFinite(parsedSaved) || parsedSaved < 0) {
      Alert.alert('Invalid saved amount', 'Please enter a valid saved amount greater than or equal to zero.');
      return;
    }

    if (editingId) {
      setGoals((current) =>
        current.map((goal) =>
          goal.id === editingId
            ? {
                ...goal,
                title: cleanTitle,
                targetAmount: parsedTarget,
                savedAmount: Math.min(parsedSaved, parsedTarget),
                dueDate,
              }
            : goal
        )
      );
    } else {
      const nextId = Date.now();
      setGoals((current) => [
        {
          id: nextId,
          title: cleanTitle,
          targetAmount: parsedTarget,
          savedAmount: Math.min(parsedSaved, parsedTarget),
          color: '#5B8DEF',
          dueDate,
        },
        ...current,
      ]);
    }

    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setTargetAmount(String(goal.targetAmount));
    setSavedAmount(String(goal.savedAmount));
    setDueDate(goal.dueDate);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete goal', 'Remove this goal from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setGoals((current) => current.filter((goal) => goal.id !== id));
          if (editingId === id) {
            resetForm();
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Goals' }} />
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
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Targets</Text>
              <Text style={[styles.title, { color: palette.text }]}>Goals</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: palette.accent }]}
              onPress={handleNewGoal}
            >
              <Plus size={18} color="#0F172A" />
              <Text style={styles.primaryActionText}>New</Text>
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
              <View style={[styles.summaryIcon, { backgroundColor: `${palette.accent}22` }]}>
                <Target size={20} color={palette.accent} />
              </View>

              <View style={styles.summaryText}>
                <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>Saved so far</Text>
                <Text style={[styles.summaryValue, { color: palette.text }]}>
                  MWK{totals.totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(totals.progress, 100)}%`,
                    backgroundColor: palette.success,
                  },
                ]}
              />
            </View>

            <View style={styles.summaryMeta}>
              <Text style={[styles.summaryMetaText, { color: palette.textSecondary }]}>
                Target: MWK{totals.totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.summaryMetaText, { color: palette.textSecondary }]}>
                Remaining: MWK{totals.totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(150).duration(400)}
            style={[
              styles.formCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              {editingId ? 'Edit goal' : 'Add a goal'}
            </Text>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Emergency fund"
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.field,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Target amount</Text>
              <TextInput
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="10000"
                keyboardType="numeric"
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.field,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Saved amount</Text>
              <TextInput
                value={savedAmount}
                onChangeText={setSavedAmount}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.field,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.label, { color: palette.textSecondary }]}>Due date</Text>
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.field,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: palette.success }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>{editingId ? 'Update goal' : 'Save goal'}</Text>
              </TouchableOpacity>

              {editingId && (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: palette.border }]}
                  onPress={resetForm}
                >
                  <Text style={[styles.cancelButtonText, { color: palette.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {goals.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              style={[
                styles.emptyCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                No goals yet. Add your first saving target to get started.
              </Text>
            </Animated.View>
          ) : (
            goals.map((goal) => {
              const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);

              return (
                <Animated.View
                  key={goal.id}
                  entering={FadeInDown.delay(200).duration(400)}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleWrap}>
                      <View style={[styles.goalDot, { backgroundColor: goal.color }]} />
                      <View>
                        <Text style={[styles.goalTitle, { color: palette.text }]}>{goal.title}</Text>
                        {goal.dueDate ? (
                          <Text style={[styles.goalDue, { color: palette.textSecondary }]}>
                            Due {new Date(goal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <Text style={[styles.goalAmount, { color: palette.text }]}>
                      MWK{goal.savedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View style={styles.goalMeta}>
                    <Text style={[styles.goalMetaText, { color: palette.textSecondary }]}>
                      Target: MWK{goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.goalMetaText, { color: palette.success }]}>
                      {progress.toFixed(0)}%
                    </Text>
                  </View>

                  <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${progress}%`,
                          backgroundColor: goal.color,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.goalActions}>
                    <TouchableOpacity
                      style={[styles.iconAction, { borderColor: palette.border, backgroundColor: palette.field }]}
                      onPress={() => handleEdit(goal)}
                    >
                      <Pencil size={14} color={palette.textSecondary} />
                      <Text style={[styles.iconActionText, { color: palette.textSecondary }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.iconAction, { borderColor: `${palette.danger}66`, backgroundColor: `${palette.danger}10` }]}
                      onPress={() => handleDelete(goal.id)}
                    >
                      <Trash2 size={14} color={palette.danger} />
                      <Text style={[styles.iconActionText, { color: palette.danger }]}>Delete</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
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
    gap: 10,
  },
  summaryMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  fieldRow: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  cancelButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  goalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  goalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  goalDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalDue: {
    fontSize: 12,
    marginTop: 2,
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  goalMeta: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalMetaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  iconAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  iconActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});